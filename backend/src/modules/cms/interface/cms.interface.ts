import type { Document, Types } from 'mongoose';
import type { SeoFields } from '../../../types/media';

export type CmsStatus = 'draft' | 'published';

export interface ICmsPage {
  title: string;
  slug: string;
  content: string;
  status: CmsStatus;
  seo?: SeoFields;
  publishedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type CmsPageDocument = Document<Types.ObjectId> & ICmsPage;
