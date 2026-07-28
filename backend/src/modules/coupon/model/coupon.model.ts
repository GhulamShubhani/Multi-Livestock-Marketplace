import { Schema, model } from 'mongoose';
import type { ICoupon } from '../interface/coupon.interface';

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    usageLimit: { type: Number, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, min: 0 },
    startsAt: { type: Date },
    endsAt: { type: Date, index: true },
    isActive: { type: Boolean, default: true, index: true },
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    applicableCats: [{ type: Schema.Types.ObjectId, ref: 'Cat' }],
  },
  { timestamps: true, collection: 'coupons' },
);

export const CouponModel = model<ICoupon>('Coupon', couponSchema);
