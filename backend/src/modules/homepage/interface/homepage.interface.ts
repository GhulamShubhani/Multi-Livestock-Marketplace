import type { Document, Types } from 'mongoose';
import type { MediaAsset } from '../../../types/media';

export const HOMEPAGE_SECTION_TYPES = [
  'hero',
  'categories',
  'carousel',
  'promo',
  'info',
  'banner',
  'cta',
] as const;

export type HomepageSectionType = (typeof HOMEPAGE_SECTION_TYPES)[number];

export interface IHomepageSection {
  key: string;
  type: HomepageSectionType;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: MediaAsset;
  ctaText?: string;
  ctaUrl?: string;
  category?: Types.ObjectId;
  displayOrder: number;
  isActive: boolean;
  config?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type HomepageSectionDocument = Document<Types.ObjectId> & IHomepageSection;
