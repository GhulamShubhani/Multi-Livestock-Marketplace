import type { MediaAsset, SeoFields } from './common';

export interface Breed {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  origin?: string;
  temperament?: string[];
  lifeSpan?: string;
  categoryIds?: string[];
  image?: MediaAsset;
  isActive: boolean;
  seo?: SeoFields;
  createdAt?: string;
  updatedAt?: string;
}
