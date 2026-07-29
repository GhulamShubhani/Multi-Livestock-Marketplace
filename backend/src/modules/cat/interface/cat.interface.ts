import type { Document, Types } from 'mongoose';
import type { CatImage, CatVideo, SeoFields } from '../../../types/media';

export type CatGender = 'male' | 'female' | 'unknown';
export type CatStatus = 'draft' | 'available' | 'reserved' | 'sold' | 'archived';

export interface ICat {
  name: string;
  slug: string;
  sku?: string;
  description: string;
  shortDescription?: string;
  breed: Types.ObjectId;
  category: Types.ObjectId;
  ageMonths: number;
  gender: CatGender;
  color?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  stock: number;
  status: CatStatus;
  images: CatImage[];
  videos: CatVideo[];
  attributes?: Record<string, string>;
  vaccinated: boolean;
  neutered: boolean;
  pedigree: boolean;
  featured: boolean;
  averageRating: number;
  reviewCount: number;
  seo?: SeoFields;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type CatDocument = Document<Types.ObjectId> & ICat;
