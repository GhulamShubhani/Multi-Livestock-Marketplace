import type { AvailabilityStatus, Gender, VerificationStatus } from '../constants/listing';
import type { MediaAsset, ListingLocation, SeoFields } from './common';

export interface ListingSummary {
  _id: string;
  title: string;
  slug: string;
  listingId: string;
  shortDescription?: string;
  category: string | { _id: string; name: string; slug: string };
  subcategory?: string | { _id: string; name: string; slug: string };
  breed?: string | { _id: string; name: string; slug: string };
  price: number;
  negotiable: boolean;
  currency: string;
  seller?: string | { _id: string; firstName?: string; lastName?: string };
  location?: Pick<ListingLocation, 'country' | 'state' | 'city' | 'district'>;
  primaryImage?: MediaAsset;
  images?: MediaAsset[];
  ageMonths?: number;
  gender?: Gender;
  weight?: number;
  availabilityStatus: AvailabilityStatus;
  verificationStatus: VerificationStatus;
  featured: boolean;
  premium?: boolean;
  isActive: boolean;
  averageRating?: number;
  reviewCount?: number;
  attributes?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Listing extends ListingSummary {
  description: string;
  sellerMobile?: string;
  sellerWhatsApp?: string;
  location: ListingLocation;
  videos?: MediaAsset[];
  healthStatus?: string;
  vaccinationStatus?: string;
  seo?: SeoFields;
  createdBy?: string;
  updatedBy?: string;
}
