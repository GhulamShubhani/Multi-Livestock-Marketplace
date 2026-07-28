import type { Document, Types } from 'mongoose';

export type UserStatus = 'active' | 'inactive' | 'banned' | 'pending';

export interface IUserAddress {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface IUser {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: { url: string; publicId: string };
  role: Types.ObjectId;
  permissionsOverride: string[];
  isEmailVerified: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  otpHash?: string;
  otpExpires?: Date;
  otpAttempts: number;
  failedLoginAttempts: number;
  lockUntil?: Date;
  status: UserStatus;
  addresses: IUserAddress[];
  stripeCustomerId?: string;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = Document<Types.ObjectId> & IUser;
