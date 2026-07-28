import { Schema, model } from 'mongoose';
import type { IBanner } from '../interface/banner.interface';

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    linkUrl: { type: String, trim: true },
    placement: {
      type: String,
      enum: ['home_hero', 'home_secondary', 'sidebar'],
      required: true,
      index: true,
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { timestamps: true, collection: 'banners' },
);

export const BannerModel = model<IBanner>('Banner', bannerSchema);
