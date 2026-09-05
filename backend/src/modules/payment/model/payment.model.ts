import { Schema, model } from 'mongoose';
import type { IPayment } from '../interface/payment.interface';

const paymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    provider: {
      type: String,
      enum: ['upi', 'bank_transfer', 'cod', 'mobile'],
      required: true,
      default: 'upi',
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'under_verification', 'verified', 'rejected', 'refunded'],
      default: 'pending',
      index: true,
    },
    method: String,
    transactionId: { type: String, trim: true, sparse: true },
    utr: { type: String, trim: true, sparse: true },
    paymentDate: Date,
    screenshot: {
      url: String,
      publicId: String,
    },
    adminNotes: String,
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    rejectedReason: String,
    ip: String,
  },
  { timestamps: true, collection: 'payments' },
);

paymentSchema.index({ createdAt: -1 });

export const PaymentModel = model<IPayment>('Payment', paymentSchema);
