import type { FilterQuery } from 'mongoose';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { OrderModel } from '../model/order.model';
import type { IOrder, OrderDocument } from '../interface/order.interface';

export class OrderRepository {
  async create(data: Partial<IOrder>): Promise<OrderDocument> {
    return OrderModel.create(data);
  }

  async findById(id: string): Promise<OrderDocument | null> {
    return OrderModel.findById(id).populate('items.cat').exec();
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderDocument | null> {
    return OrderModel.findOne({ orderNumber }).exec();
  }

  async findByIdForUser(id: string, userId: string): Promise<OrderDocument | null> {
    return OrderModel.findOne({ _id: id, user: userId }).populate('items.cat').exec();
  }

  async listForUser(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<IOrder> = { user: userId };
    if (typeof query.status === 'string') filter.status = query.status as IOrder['status'];

    const [items, total] = await Promise.all([
      OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      OrderModel.countDocuments(filter).exec(),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async listAdmin(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<IOrder> = {};
    if (typeof query.status === 'string') filter.status = query.status as IOrder['status'];
    if (typeof query.userId === 'string') filter.user = query.userId;
    if (typeof query.q === 'string' && query.q) {
      filter.orderNumber = { $regex: query.q, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'email firstName lastName').exec(),
      OrderModel.countDocuments(filter).exec(),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async save(order: OrderDocument): Promise<OrderDocument> {
    return order.save();
  }

  async updateById(id: string, data: Partial<IOrder>): Promise<OrderDocument | null> {
    return OrderModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }
}

export const orderRepository = new OrderRepository();
