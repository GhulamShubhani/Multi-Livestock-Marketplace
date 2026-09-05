import type { PaymentMethod, PaymentStatus } from '../constants/payment';
import type { MediaAsset } from './common';

export interface PaymentRefund {
  amount: number;
  reason?: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  order?: string;
  listing?: string;
  user: string;
  seller?: string;
  provider: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  transactionId?: string;
  utr?: string;
  paymentDate?: string;
  screenshot?: MediaAsset;
  adminNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectedReason?: string;
  refunds?: PaymentRefund[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentSettings {
  receiverName?: string;
  mobile?: string;
  upiId?: string;
  qrCode?: MediaAsset;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  instructions?: string;
}
