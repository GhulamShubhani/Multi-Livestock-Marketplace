import type { Document, Types } from 'mongoose';

export type CouponType = 'percent' | 'fixed';

export interface ICoupon {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  startsAt?: Date;
  endsAt?: Date;
  isActive: boolean;
  applicableCategories?: Types.ObjectId[];
  applicableCats?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type CouponDocument = Document<Types.ObjectId> & ICoupon;
