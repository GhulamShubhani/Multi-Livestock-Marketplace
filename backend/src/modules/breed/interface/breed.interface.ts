import type { Document, Types } from 'mongoose';
import type { MediaAsset, SeoFields } from '../../../types/media';

export interface IBreed {
  name: string;
  slug: string;
  description?: string;
  origin?: string;
  temperament?: string[];
  lifeSpan?: string;
  categoryIds: Types.ObjectId[];
  image?: MediaAsset;
  isActive: boolean;
  seo?: SeoFields;
  createdAt: Date;
  updatedAt: Date;
}

export type BreedDocument = Document<Types.ObjectId> & IBreed;
