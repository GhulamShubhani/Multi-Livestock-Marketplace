import { Types } from 'mongoose';
import { AppError } from '../../../utils/AppError';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { orderRepository } from '../../order/repository/order.repository';
import { orderService } from '../../order/service/order.service';
import { settingsRepository } from '../../settings/repository/settings.repository';
import { paymentRepository } from '../repository/payment.repository';
import type { PaymentProvider, PaymentRecordStatus } from '../interface/payment.interface';
import type { MediaAsset } from '../../../types/media';

export interface SubmitPaymentInput {
  orderId: string;
  provider?: PaymentProvider;
  method?: string;
  transactionId?: string;
  utr?: string;
  paymentDate?: string | Date;
  screenshot?: MediaAsset;
}

export class PaymentService {
  async getPublicMethods() {
    const settings = await settingsRepository.findByKey('payment');
    const value = (settings?.value ?? {}) as Record<string, unknown>;

    return {
      receiverName: value.receiverName ?? null,
      mobile: value.mobile ?? null,
      upiId: value.upiId ?? null,
      qrCode: value.qrCode ?? null,
      bankName: value.bankName ?? null,
      accountHolder: value.accountHolder ?? null,
      accountNumber: value.accountNumber ?? null,
      ifsc: value.ifsc ?? null,
      instructions: value.instructions ?? null,
      providers: ['upi', 'bank_transfer', 'cod', 'mobile'],
    };
  }

  async submitProof(userId: string, dto: SubmitPaymentInput, ip?: string) {
    const order = await orderRepository.findByIdForUser(dto.orderId, userId);
    if (!order) throw AppError.notFound('Order not found');
    if (order.paymentStatus === 'paid') throw AppError.badRequest('Order already paid');
    if (order.status === 'cancelled') throw AppError.badRequest('Order is cancelled');

    let payment = await paymentRepository.findByOrder(dto.orderId);
    if (!payment) {
      payment = await paymentRepository.create({
        order: order._id as Types.ObjectId,
        user: new Types.ObjectId(userId),
        provider: dto.provider ?? 'upi',
        amount: order.total,
        currency: order.currency,
        status: 'pending',
        ip,
      });
    }

    if (['verified', 'refunded'].includes(payment.status)) {
      throw AppError.badRequest('Payment can no longer be updated');
    }

    payment.provider = dto.provider ?? payment.provider ?? 'upi';
    payment.method = dto.method ?? payment.method;
    payment.transactionId = dto.transactionId ?? payment.transactionId;
    payment.utr = dto.utr ?? payment.utr;
    payment.paymentDate = dto.paymentDate
      ? new Date(dto.paymentDate)
      : (payment.paymentDate ?? new Date());
    payment.screenshot = dto.screenshot ?? payment.screenshot;
    payment.status = 'submitted';
    payment.ip = ip ?? payment.ip;
    await paymentRepository.save(payment);

    await orderRepository.updateById(String(order._id), { paymentStatus: 'unpaid' });

    await activityLogService.log({
      actor: userId,
      action: 'payments.submit',
      module: 'payments',
      resourceId: payment._id,
      ip,
    });

    return paymentRepository.findById(String(payment._id));
  }

  async verify(
    paymentId: string,
    actorId: string,
    decision: 'verified' | 'rejected',
    opts?: { adminNotes?: string; rejectedReason?: string },
  ) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw AppError.notFound('Payment not found');
    if (!['submitted', 'under_verification', 'pending'].includes(payment.status)) {
      throw AppError.badRequest('Payment is not awaiting verification');
    }

    if (decision === 'rejected') {
      payment.status = 'rejected';
      payment.rejectedReason = opts?.rejectedReason ?? 'Rejected by admin';
      payment.adminNotes = opts?.adminNotes;
      payment.verifiedBy = new Types.ObjectId(actorId);
      payment.verifiedAt = new Date();
      await paymentRepository.save(payment);

      if (payment.order) {
        await orderRepository.updateById(String(payment.order), { paymentStatus: 'failed' });
      }

      await activityLogService.log({
        actor: actorId,
        action: 'payments.reject',
        module: 'payments',
        resourceId: paymentId,
        severity: 'warn',
      });
      return payment;
    }

    payment.status = 'verified';
    payment.adminNotes = opts?.adminNotes;
    payment.rejectedReason = undefined;
    payment.verifiedBy = new Types.ObjectId(actorId);
    payment.verifiedAt = new Date();
    await paymentRepository.save(payment);

    if (payment.order) {
      await orderService.markPaid(String(payment.order));
    }

    await activityLogService.log({
      actor: actorId,
      action: 'payments.verify',
      module: 'payments',
      resourceId: paymentId,
    });

    return payment;
  }

  async markUnderVerification(paymentId: string, actorId: string) {
    const payment = await paymentRepository.updateById(paymentId, {
      status: 'under_verification' as PaymentRecordStatus,
    });
    if (!payment) throw AppError.notFound('Payment not found');
    await activityLogService.log({
      actor: actorId,
      action: 'payments.under_verification',
      module: 'payments',
      resourceId: paymentId,
    });
    return payment;
  }

  async refund(paymentId: string, actorId: string, reason?: string) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw AppError.notFound('Payment not found');
    if (payment.status !== 'verified') {
      throw AppError.badRequest('Only verified payments can be marked refunded');
    }

    payment.status = 'refunded';
    payment.adminNotes = reason ?? payment.adminNotes;
    await paymentRepository.save(payment);

    if (payment.order) {
      await orderRepository.updateById(String(payment.order), {
        paymentStatus: 'refunded',
        status: 'refunded',
      });
    }

    await activityLogService.log({
      actor: actorId,
      action: 'payments.refund',
      module: 'payments',
      resourceId: paymentId,
      metadata: { reason },
      severity: 'warn',
    });

    return payment;
  }

  async listMine(userId: string, query: Record<string, unknown>) {
    return paymentRepository.listForUser(userId, query);
  }

  async listAdmin(query: Record<string, unknown>) {
    return paymentRepository.listAdmin(query);
  }
}

export const paymentService = new PaymentService();
