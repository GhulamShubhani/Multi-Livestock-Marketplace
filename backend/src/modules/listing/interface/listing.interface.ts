import type { Document, Types } from 'mongoose';
import type { ListingImage, ListingVideo, SeoFields } from '../../../types/media';

export type ListingGender = 'male' | 'female' | 'unknown';
export type AvailabilityStatus = 'draft' | 'available' | 'reserved' | 'sold' | 'archived';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface IListingLocation {
  country: string;
  state: string;
  district?: string;
  city: string;
  village?: string;
  area?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface IListing {
  title: string;
  slug: string;
  listingId: string;
  description: string;
  shortDescription?: string;
  category: Types.ObjectId;
  subcategory?: Types.ObjectId;
  breed?: Types.ObjectId;
  price: number;
  negotiable: boolean;
  currency: string;
  seller: Types.ObjectId;
  sellerMobile?: string;
  sellerWhatsApp?: string;
  location: IListingLocation;
  images: ListingImage[];
  videos: ListingVideo[];
  ageMonths?: number;
  gender: ListingGender;
  weight?: number;
  healthStatus?: string;
  vaccinationStatus?: string;
  availabilityStatus: AvailabilityStatus;
  verificationStatus: VerificationStatus;
  featured: boolean;
  premium: boolean;
  isActive: boolean;
  attributes?: Record<string, unknown>;
  averageRating: number;
  reviewCount: number;
  seo?: SeoFields;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ListingDocument = Document<Types.ObjectId> & IListing;
