import { Types } from 'mongoose';
import { env, isDevelopment } from '../../../config/env';
import { isStripeConfigured, stripe } from '../../../config/stripe';
import { logger } from '../../../config/logger';
import { AppError } from '../../../utils/AppError';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { orderRepository } from '../../order/repository/order.repository';
import { orderService } from '../../order/service/order.service';
import { paymentRepository } from '../repository/payment.repository';
import type { PaymentDocument } from '../interface/payment.interface';

export class PaymentService {
  async createCheckoutSession(userId: string, orderId: string, ip?: string) {
    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) throw AppError.notFound('Order not found');
    if (order.paymentStatus === 'paid') throw AppError.badRequest('Order already paid');
    if (order.status === 'cancelled') throw AppError.badRequest('Order is cancelled');

    let payment = await paymentRepository.findByOrder(orderId);
    if (!payment) {
      payment = await paymentRepository.create({
        order: order._id as Types.ObjectId,
        user: new Types.ObjectId(userId),
        provider: 'stripe',
        amount: order.total,
        currency: order.currency,
        status: 'pending',
        ip,
      });
    }

    if (!isStripeConfigured || !stripe) {
      const mockSessionId = `mock_cs_${String(payment._id)}`;
      payment.stripeCheckoutSessionId = mockSessionId;
      await paymentRepository.save(payment);

      return {
        mock: true,
        sessionId: mockSessionId,
        url: `${env.FRONTEND_URL}/checkout/success?session_id=${mockSessionId}&mock=1`,
        paymentId: String(payment._id),
      };
    }

    const successUrl =
      env.STRIPE_SUCCESS_URL ?? `${env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = env.STRIPE_CANCEL_URL ?? `${env.FRONTEND_URL}/checkout/cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: String(order._id),
      metadata: {
        orderId: String(order._id),
        paymentId: String(payment._id),
        userId,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: order.currency.toLowerCase(),
            unit_amount: order.total,
            product_data: {
              name: `Order ${order.orderNumber}`,
              description: order.items.map((i) => i.name).join(', ').slice(0, 400),
            },
          },
        },
      ],
    });

    payment.stripeCheckoutSessionId = session.id;
    await paymentRepository.save(payment);

    await activityLogService.log({
      actor: userId,
      action: 'payments.checkout_session',
      module: 'payments',
      resourceId: payment._id,
      ip,
    });

    return {
      mock: false,
      sessionId: session.id,
      url: session.url,
      paymentId: String(payment._id),
    };
  }

  async createPaymentIntent(userId: string, orderId: string, ip?: string) {
    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) throw AppError.notFound('Order not found');
    if (order.paymentStatus === 'paid') throw AppError.badRequest('Order already paid');

    let payment = await paymentRepository.findByOrder(orderId);
    if (!payment) {
      payment = await paymentRepository.create({
        order: order._id as Types.ObjectId,
        user: new Types.ObjectId(userId),
        provider: 'stripe',
        amount: order.total,
        currency: order.currency,
        status: 'pending',
        ip,
      });
    }

    if (!isStripeConfigured || !stripe) {
      const mockIntent = `mock_pi_${String(payment._id)}`;
      payment.stripePaymentIntentId = mockIntent;
      await paymentRepository.save(payment);
      return {
        mock: true,
        clientSecret: `${mockIntent}_secret_mock`,
        paymentIntentId: mockIntent,
        paymentId: String(payment._id),
      };
    }

    const intent = await stripe.paymentIntents.create({
      amount: order.total,
      currency: order.currency.toLowerCase(),
      metadata: {
        orderId: String(order._id),
        paymentId: String(payment._id),
        userId,
      },
      automatic_payment_methods: { enabled: true },
    });

    payment.stripePaymentIntentId = intent.id;
    await paymentRepository.save(payment);

    return {
      mock: false,
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      paymentId: String(payment._id),
    };
  }

  async mockComplete(sessionOrPaymentId: string, userId: string) {
    if (!isDevelopment) {
      throw AppError.forbidden('Mock payments are only available in development');
    }

    let payment = await paymentRepository.findByCheckoutSession(sessionOrPaymentId);
    if (!payment && /^[a-f\d]{24}$/i.test(sessionOrPaymentId)) {
      payment = await paymentRepository.findById(sessionOrPaymentId);
    }
    if (!payment && sessionOrPaymentId.startsWith('mock_pi_')) {
      payment = await paymentRepository.findByPaymentIntent(sessionOrPaymentId);
    }

    if (!payment) throw AppError.notFound('Payment not found');
    if (String(payment.user) !== userId) throw AppError.forbidden('Forbidden');

    return this.markSucceeded(payment, `mock_event_${Date.now()}`);
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!isStripeConfigured || !stripe) {
      throw AppError.badRequest('Stripe is not configured');
    }
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw AppError.badRequest('Stripe webhook secret missing');
    }
    if (!signature) {
      throw AppError.unauthorized('Missing Stripe signature');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
      logger.error('Stripe webhook signature verification failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw AppError.unauthorized('Invalid Stripe webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as { id: string; payment_intent?: string | { id: string } };
      const payment = await paymentRepository.findByCheckoutSession(session.id);
      if (payment) {
        if (typeof session.payment_intent === 'string') {
          payment.stripePaymentIntentId = session.payment_intent;
        } else if (session.payment_intent?.id) {
          payment.stripePaymentIntentId = session.payment_intent.id;
        }
        await this.markSucceeded(payment, event.id);
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as { id: string };
      const payment = await paymentRepository.findByPaymentIntent(intent.id);
      if (payment) {
        await this.markSucceeded(payment, event.id);
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as { id: string };
      const payment = await paymentRepository.findByPaymentIntent(intent.id);
      if (payment && !payment.processedEventIds.includes(event.id)) {
        payment.status = 'failed';
        payment.processedEventIds.push(event.id);
        await paymentRepository.save(payment);
        await orderRepository.updateById(String(payment.order), { paymentStatus: 'failed' });
      }
    }

    return { received: true };
  }

  async refund(paymentId: string, actorId: string, amount?: number, reason?: string) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw AppError.notFound('Payment not found');
    if (payment.status !== 'succeeded' && payment.status !== 'partially_refunded') {
      throw AppError.badRequest('Payment is not refundable');
    }

    const refundAmount = amount ?? payment.amount;
    if (refundAmount <= 0 || refundAmount > payment.amount) {
      throw AppError.badRequest('Invalid refund amount');
    }

    let stripeRefundId: string | undefined;

    if (isStripeConfigured && stripe && payment.stripePaymentIntentId && !payment.stripePaymentIntentId.startsWith('mock_')) {
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: refundAmount,
        reason: reason === 'fraudulent' ? 'fraudulent' : reason === 'duplicate' ? 'duplicate' : 'requested_by_customer',
      });
      stripeRefundId = refund.id;
    }

    payment.refunds.push({
      stripeRefundId,
      amount: refundAmount,
      reason,
      createdAt: new Date(),
    });

    const refundedTotal = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
    payment.status = refundedTotal >= payment.amount ? 'refunded' : 'partially_refunded';
    await paymentRepository.save(payment);

    await orderRepository.updateById(String(payment.order), {
      paymentStatus: payment.status === 'refunded' ? 'refunded' : 'partially_refunded',
      ...(payment.status === 'refunded' ? { status: 'refunded' as const } : {}),
    });

    await activityLogService.log({
      actor: actorId,
      action: 'payments.refund',
      module: 'payments',
      resourceId: paymentId,
      metadata: { amount: refundAmount, stripeRefundId },
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

  private async markSucceeded(payment: PaymentDocument, eventId: string) {
    if (payment.processedEventIds.includes(eventId)) {
      return payment;
    }
    if (payment.status === 'succeeded') {
      payment.processedEventIds.push(eventId);
      await paymentRepository.save(payment);
      return payment;
    }

    payment.status = 'succeeded';
    payment.processedEventIds.push(eventId);
    await paymentRepository.save(payment);
    await orderService.markPaid(String(payment.order));

    await activityLogService.log({
      actor: payment.user,
      action: 'payments.succeeded',
      module: 'payments',
      resourceId: payment._id,
      metadata: { eventId },
    });

    return payment;
  }
}

export const paymentService = new PaymentService();
