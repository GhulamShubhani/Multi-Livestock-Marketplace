import type { Document, Types } from 'mongoose';

export type PaymentRecordStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface IPaymentRefund {
  stripeRefundId?: string;
  amount: number;
  reason?: string;
  createdAt: Date;
}

export interface IPayment {
  order: Types.ObjectId;
  user: Types.ObjectId;
  provider: 'stripe';
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;
  stripeInvoiceId?: string;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  method?: string;
  receiptUrl?: string;
  refunds: IPaymentRefund[];
  processedEventIds: string[];
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentDocument = Document<Types.ObjectId> & IPayment;
