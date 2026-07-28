import { Schema, model } from 'mongoose';
import type { IPayment } from '../interface/payment.interface';

const paymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: String, enum: ['stripe'], default: 'stripe' },
    stripePaymentIntentId: { type: String, sparse: true, unique: true },
    stripeCheckoutSessionId: { type: String, sparse: true, unique: true },
    stripeInvoiceId: { type: String },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },
    method: String,
    receiptUrl: String,
    refunds: [
      {
        stripeRefundId: String,
        amount: { type: Number, required: true },
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    processedEventIds: { type: [String], default: [] },
    ip: String,
  },
  { timestamps: true, collection: 'payments' },
);

export const PaymentModel = model<IPayment>('Payment', paymentSchema);
