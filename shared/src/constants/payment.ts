export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  UNDER_VERIFICATION: 'under_verification',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUSES);

export const PAYMENT_METHODS = {
  UPI: 'upi',
  BANK_TRANSFER: 'bank_transfer',
  COD: 'cod',
  MOBILE: 'mobile',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHODS);

/** Alias used by payment provider field on records */
export type PaymentProvider = PaymentMethod;
