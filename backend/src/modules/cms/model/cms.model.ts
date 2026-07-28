import { Schema, model } from 'mongoose';
import type { ICmsPage } from '../interface/cms.interface';

const cmsSchema = new Schema<ICmsPage>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'cms_pages' },
);

export const CmsPageModel = model<ICmsPage>('CmsPage', cmsSchema);
