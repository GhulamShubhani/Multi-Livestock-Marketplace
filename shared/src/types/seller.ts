import type { VerificationStatus } from '../constants/listing';
import type { MediaAsset } from './common';

export type SellerType = 'individual' | 'farmer' | 'breeder' | 'farm' | 'dealer' | 'business';

export interface SellerProfile {
  _id: string;
  userId: string;
  businessName?: string;
  sellerType: SellerType;
  yearsOfExperience?: number;
  verificationStatus: VerificationStatus;
  whatsapp?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  avatar?: MediaAsset;
  createdAt?: string;
  updatedAt?: string;
}
