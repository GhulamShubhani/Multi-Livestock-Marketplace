import type { Document, Types } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'unpaid'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface IOrderAddress {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface IOrderItem {
  cat: Types.ObjectId;
  name: string;
  sku?: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface IOrder {
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  coupon?: Types.ObjectId;
  couponCode?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: IOrderAddress;
  billingAddress?: IOrderAddress;
  notes?: string;
  paidAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = Document<Types.ObjectId> & IOrder;
