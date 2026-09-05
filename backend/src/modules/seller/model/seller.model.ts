import { Schema, model } from 'mongoose';
import type { ISellerProfile } from '../interface/seller.interface';

const addressSchema = new Schema(
  {
    line1: String,
    line2: String,
    village: String,
    city: String,
    district: String,
    state: String,
    pincode: String,
    country: String,
  },
  { _id: false },
);

const sellerSchema = new Schema<ISellerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    businessName: { type: String, required: true, trim: true },
    sellerType: {
      type: String,
      enum: ['individual', 'farmer', 'breeder', 'farm', 'dealer', 'business'],
      default: 'individual',
    },
    yearsOfExperience: { type: Number, min: 0 },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
      index: true,
    },
    whatsapp: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: addressSchema,
    bio: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: 'sellers' },
);

export const SellerModel = model<ISellerProfile>('Seller', sellerSchema);
