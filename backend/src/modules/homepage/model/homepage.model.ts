import { Schema, model } from 'mongoose';
import type { IHomepageSection } from '../interface/homepage.interface';
import { HOMEPAGE_SECTION_TYPES } from '../interface/homepage.interface';

const homepageSectionSchema = new Schema<IHomepageSection>(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    type: { type: String, enum: HOMEPAGE_SECTION_TYPES, required: true },
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, trim: true },
    image: {
      url: String,
      publicId: String,
    },
    ctaText: { type: String, trim: true },
    ctaUrl: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    displayOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: 'homepage_sections' },
);

export const HomepageSectionModel = model<IHomepageSection>(
  'HomepageSection',
  homepageSectionSchema,
);
