import type { Document, Types } from 'mongoose';
import type { MediaAsset } from '../../../types/media';

export type PaymentProvider = 'upi' | 'bank_transfer' | 'cod' | 'mobile';

export type PaymentRecordStatus =
  'pending' | 'submitted' | 'under_verification' | 'verified' | 'rejected' | 'refunded';

export interface IPayment {
  order?: Types.ObjectId;
  listing?: Types.ObjectId;
  user: Types.ObjectId;
  seller?: Types.ObjectId;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  method?: string;
  transactionId?: string;
  utr?: string;
  paymentDate?: Date;
  screenshot?: MediaAsset;
  adminNotes?: string;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  rejectedReason?: string;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentDocument = Document<Types.ObjectId> & IPayment;
