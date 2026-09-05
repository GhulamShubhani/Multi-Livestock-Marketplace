import type { Document, Types } from 'mongoose';
import type { MediaAsset, SeoFields } from '../../../types/media';

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: MediaAsset;
  icon?: string;
  group?: string;
  parent?: Types.ObjectId;
  listingCount: number;
  attributes: Types.ObjectId[];
  isActive: boolean;
  sortOrder: number;
  seo?: SeoFields;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryDocument = Document<Types.ObjectId> & ICategory;
