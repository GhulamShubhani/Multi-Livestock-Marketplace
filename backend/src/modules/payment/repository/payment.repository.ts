import { PaymentModel } from '../model/payment.model';
import type { IPayment, PaymentDocument } from '../interface/payment.interface';
import type { FilterQuery } from 'mongoose';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';

export class PaymentRepository {
  async create(data: Partial<IPayment>): Promise<PaymentDocument> {
    return PaymentModel.create(data);
  }

  async findById(id: string): Promise<PaymentDocument | null> {
    return PaymentModel.findById(id).populate('order').exec();
  }

  async findByOrder(orderId: string): Promise<PaymentDocument | null> {
    return PaymentModel.findOne({ order: orderId }).sort({ createdAt: -1 }).exec();
  }

  async findByCheckoutSession(sessionId: string): Promise<PaymentDocument | null> {
    return PaymentModel.findOne({ stripeCheckoutSessionId: sessionId }).exec();
  }

  async findByPaymentIntent(intentId: string): Promise<PaymentDocument | null> {
    return PaymentModel.findOne({ stripePaymentIntentId: intentId }).exec();
  }

  async save(payment: PaymentDocument): Promise<PaymentDocument> {
    return payment.save();
  }

  async listForUser(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<IPayment> = { user: userId };
    const [items, total] = await Promise.all([
      PaymentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      PaymentModel.countDocuments(filter).exec(),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async listAdmin(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<IPayment> = {};
    if (typeof query.status === 'string') filter.status = query.status as IPayment['status'];
    const [items, total] = await Promise.all([
      PaymentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('order user').exec(),
      PaymentModel.countDocuments(filter).exec(),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }
}

export const paymentRepository = new PaymentRepository();
