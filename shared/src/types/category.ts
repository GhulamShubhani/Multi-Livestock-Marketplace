import type { MediaAsset, SeoFields } from './common';

export type CategoryGroup = 'companion' | 'livestock' | 'poultry' | 'other' | string;

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: MediaAsset;
  icon?: string;
  group?: CategoryGroup;
  parent?: string;
  attributes?: string[];
  listingCount: number;
  isActive: boolean;
  sortOrder: number;
  seo?: SeoFields;
  createdAt?: string;
  updatedAt?: string;
}
