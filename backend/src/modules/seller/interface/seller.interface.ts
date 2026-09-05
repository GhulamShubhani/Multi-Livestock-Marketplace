import type { Document, Types } from 'mongoose';

export type SellerType = 'individual' | 'farmer' | 'breeder' | 'farm' | 'dealer' | 'business';
export type SellerVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface ISellerAddress {
  line1?: string;
  line2?: string;
  village?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface ISellerProfile {
  userId: Types.ObjectId;
  businessName: string;
  sellerType: SellerType;
  yearsOfExperience?: number;
  verificationStatus: SellerVerificationStatus;
  whatsapp?: string;
  phone?: string;
  address?: ISellerAddress;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SellerDocument = Document<Types.ObjectId> & ISellerProfile;
