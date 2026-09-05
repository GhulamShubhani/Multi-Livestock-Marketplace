import { Schema, model } from 'mongoose';
import type { IUser } from '../interface/user.interface';

const addressSchema = new Schema(
  {
    label: { type: String, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    avatar: {
      url: String,
      publicId: String,
    },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true, index: true },
    permissionsOverride: { type: [String], default: [] },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    otpHash: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0 },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    status: {
      type: String,
      enum: ['active', 'inactive', 'banned', 'pending'],
      default: 'active',
      index: true,
    },
    addresses: { type: [addressSchema], default: [] },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
  },
  { timestamps: true, collection: 'users' },
);

userSchema.index({ phone: 1 }, { sparse: true });

export const UserModel = model<IUser>('User', userSchema);
