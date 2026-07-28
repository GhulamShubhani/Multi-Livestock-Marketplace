import { randomBytes } from 'crypto';
import { Types } from 'mongoose';
import { env } from '../../../config/env';
import { AppError } from '../../../utils/AppError';
import { refId } from '../../../utils/refId';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { catRepository } from '../../cat/repository/cat.repository';
import { couponService } from '../../coupon/service/coupon.service';
import { couponRepository } from '../../coupon/repository/coupon.repository';
import { orderRepository } from '../repository/order.repository';
import type {
  IOrderAddress,
  IOrderItem,
  OrderStatus,
} from '../interface/order.interface';

export interface CreateOrderItemInput {
  catId: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  shippingAddress: IOrderAddress;
  billingAddress?: IOrderAddress;
  couponCode?: string;
  notes?: string;
}

function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(3).toString('hex').toUpperCase();
  return `CAT-${stamp}-${rand}`;
}

export class OrderService {
  async create(userId: string, dto: CreateOrderInput, ip?: string) {
    if (!dto.items?.length) {
      throw AppError.badRequest('Order must include at least one item');
    }

    const lineItems: IOrderItem[] = [];
    const catIds: string[] = [];
    const categoryIds: string[] = [];

    for (const item of dto.items) {
      if (!item.quantity || item.quantity < 1) {
        throw AppError.badRequest('Invalid quantity');
      }

      const cat = await catRepository.findById(item.catId);
      if (!cat || cat.status !== 'available') {
        throw AppError.badRequest(`Cat unavailable: ${item.catId}`);
      }
      if (cat.stock < item.quantity) {
        throw AppError.badRequest(`Insufficient stock for ${cat.name}`);
      }

      // unique pets: prevent duplicate cat in same order
      if (catIds.includes(String(cat._id))) {
        throw AppError.badRequest('Duplicate cat in order');
      }

      const unitPrice = cat.price;
      const lineTotal = unitPrice * item.quantity;
      const primaryImage = cat.images?.find((i) => i.isPrimary)?.url ?? cat.images?.[0]?.url;

      lineItems.push({
        cat: cat._id as Types.ObjectId,
        name: cat.name,
        sku: cat.sku,
        image: primaryImage,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      });
      catIds.push(String(cat._id));
      categoryIds.push(String(cat.category));
    }

    const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
    let discount = 0;
    let couponId: Types.ObjectId | undefined;
    let couponCode: string | undefined;

    if (dto.couponCode) {
      const validated = await couponService.validateForOrder(
        dto.couponCode,
        subtotal,
        catIds,
        categoryIds,
      );
      discount = validated.discount;
      couponId = validated.coupon._id as Types.ObjectId;
      couponCode = validated.coupon.code;
    }

    const taxable = Math.max(subtotal - discount, 0);
    const tax = Math.floor((taxable * env.TAX_RATE_BPS) / 10_000);
    const shipping = env.SHIPPING_FLAT_CENTS;
    const total = taxable + tax + shipping;

    const order = await orderRepository.create({
      orderNumber: generateOrderNumber(),
      user: new Types.ObjectId(userId),
      items: lineItems,
      subtotal,
      discount,
      tax,
      shipping,
      total,
      currency: env.DEFAULT_CURRENCY,
      coupon: couponId,
      couponCode,
      status: 'pending',
      paymentStatus: 'unpaid',
      shippingAddress: dto.shippingAddress,
      billingAddress: dto.billingAddress ?? dto.shippingAddress,
      notes: dto.notes,
    });

    // Reserve stock
    for (const item of dto.items) {
      const cat = await catRepository.findById(item.catId);
      if (!cat) continue;
      const nextStock = cat.stock - item.quantity;
      await catRepository.updateById(String(cat._id), {
        stock: nextStock,
        status: nextStock <= 0 ? 'reserved' : cat.status,
      });
    }

    if (couponId) {
      await couponRepository.incrementUsed(String(couponId));
    }

    await activityLogService.log({
      actor: userId,
      action: 'orders.create',
      module: 'orders',
      resourceId: order._id,
      ip,
      metadata: { orderNumber: order.orderNumber, total: order.total },
    });

    return orderRepository.findById(String(order._id));
  }

  async listMine(userId: string, query: Record<string, unknown>) {
    return orderRepository.listForUser(userId, query);
  }

  async getMine(userId: string, orderId: string) {
    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) throw AppError.notFound('Order not found');
    return order;
  }

  async listAdmin(query: Record<string, unknown>) {
    return orderRepository.listAdmin(query);
  }

  async getAdmin(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw AppError.notFound('Order not found');
    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus, actorId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw AppError.notFound('Order not found');

    order.status = status;
    if (status === 'cancelled') order.cancelledAt = new Date();
    await orderRepository.save(order);

    await activityLogService.log({
      actor: actorId,
      action: 'orders.status_update',
      module: 'orders',
      resourceId: orderId,
      metadata: { status },
    });
    return order;
  }

  async cancel(orderId: string, userId: string, isAdmin = false) {
    const order = isAdmin
      ? await orderRepository.findById(orderId)
      : await orderRepository.findByIdForUser(orderId, userId);

    if (!order) throw AppError.notFound('Order not found');
    if (!['pending', 'paid'].includes(order.status)) {
      throw AppError.badRequest('Order cannot be cancelled');
    }
    if (order.paymentStatus === 'paid') {
      throw AppError.badRequest('Paid orders require a refund flow');
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await orderRepository.save(order);

    // Restock
    for (const item of order.items) {
      const cat = await catRepository.findById(refId(item.cat));
      if (!cat) continue;
      const nextStock = cat.stock + item.quantity;
      await catRepository.updateById(String(cat._id), {
        stock: nextStock,
        status: cat.status === 'reserved' || cat.status === 'sold' ? 'available' : cat.status,
      });
    }

    await activityLogService.log({
      actor: userId,
      action: 'orders.cancel',
      module: 'orders',
      resourceId: orderId,
      severity: 'warn',
    });

    return order;
  }

  async markPaid(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw AppError.notFound('Order not found');

    order.paymentStatus = 'paid';
    order.status = order.status === 'pending' ? 'paid' : order.status;
    order.paidAt = new Date();
    await orderRepository.save(order);

    for (const item of order.items) {
      const cat = await catRepository.findById(refId(item.cat));
      if (!cat) continue;
      if (cat.stock <= 0 || cat.status === 'reserved') {
        await catRepository.updateById(String(cat._id), { status: 'sold' });
      }
    }

    return order;
  }
}

export const orderService = new OrderService();
