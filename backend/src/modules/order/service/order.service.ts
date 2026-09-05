import { randomBytes } from 'crypto';
import { Types } from 'mongoose';
import { env } from '../../../config/env';
import { AppError } from '../../../utils/AppError';
import { refId } from '../../../utils/refId';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { listingRepository } from '../../listing/repository/listing.repository';
import { couponService } from '../../coupon/service/coupon.service';
import { couponRepository } from '../../coupon/repository/coupon.repository';
import { paymentRepository } from '../../payment/repository/payment.repository';
import { orderRepository } from '../repository/order.repository';
import type { IOrderAddress, IOrderItem, OrderStatus } from '../interface/order.interface';

export interface CreateOrderItemInput {
  listingId: string;
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
  return `LST-${stamp}-${rand}`;
}

export class OrderService {
  async create(userId: string, dto: CreateOrderInput, ip?: string) {
    if (!dto.items?.length) {
      throw AppError.badRequest('Order must include at least one item');
    }

    const lineItems: IOrderItem[] = [];
    const listingIds: string[] = [];
    const categoryIds: string[] = [];

    for (const item of dto.items) {
      if (!item.quantity || item.quantity < 1) {
        throw AppError.badRequest('Invalid quantity');
      }

      const listing = await listingRepository.findById(item.listingId);
      if (!listing || listing.availabilityStatus !== 'available' || !listing.isActive) {
        throw AppError.badRequest(`Listing unavailable: ${item.listingId}`);
      }

      if (listingIds.includes(String(listing._id))) {
        throw AppError.badRequest('Duplicate listing in order');
      }

      if (item.quantity > 1) {
        throw AppError.badRequest('Livestock listings are unique — quantity must be 1');
      }

      const unitPrice = listing.price;
      const lineTotal = unitPrice * item.quantity;
      const primaryImage =
        listing.images?.find((i) => i.isPrimary)?.url ?? listing.images?.[0]?.url;

      lineItems.push({
        listing: listing._id as Types.ObjectId,
        name: listing.title,
        sku: listing.listingId,
        image: primaryImage,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      });
      listingIds.push(String(listing._id));
      categoryIds.push(String(listing.category));
    }

    const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
    let discount = 0;
    let couponId: Types.ObjectId | undefined;
    let couponCode: string | undefined;

    if (dto.couponCode) {
      const validated = await couponService.validateForOrder(
        dto.couponCode,
        subtotal,
        listingIds,
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

    for (const item of dto.items) {
      await listingRepository.updateById(item.listingId, {
        availabilityStatus: 'reserved',
      });
    }

    if (couponId) {
      await couponRepository.incrementUsed(String(couponId));
    }

    await paymentRepository.create({
      order: order._id as Types.ObjectId,
      user: new Types.ObjectId(userId),
      provider: 'upi',
      amount: order.total,
      currency: order.currency,
      status: 'pending',
      ip,
    });

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

    for (const item of order.items) {
      const listing = await listingRepository.findById(refId(item.listing));
      if (!listing) continue;
      if (listing.availabilityStatus === 'reserved') {
        await listingRepository.updateById(String(listing._id), {
          availabilityStatus: 'available',
        });
      }
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
      await listingRepository.updateById(refId(item.listing), {
        availabilityStatus: 'sold',
      });
    }

    return order;
  }
}

export const orderService = new OrderService();
