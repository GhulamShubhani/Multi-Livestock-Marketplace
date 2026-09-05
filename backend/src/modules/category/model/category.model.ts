import { Schema, model } from 'mongoose';
import type { ICategory } from '../interface/category.interface';

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    image: {
      url: String,
      publicId: String,
    },
    icon: { type: String, trim: true },
    group: { type: String, trim: true, index: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    listingCount: { type: Number, default: 0, min: 0 },
    attributes: [{ type: Schema.Types.ObjectId, ref: 'Attribute' }],
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  { timestamps: true, collection: 'categories' },
);

export const CategoryModel = model<ICategory>('Category', categorySchema);
