import { Schema, model } from 'mongoose';
import type { ICat } from '../interface/cat.interface';

const catImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    alt: { type: String },
  },
  { _id: false },
);

const catSchema = new Schema<ICat>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, trim: true, sparse: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, trim: true },
    breed: { type: Schema.Types.ObjectId, ref: 'Breed', required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    ageMonths: { type: Number, required: true, min: 0 },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    color: { type: String, trim: true },
    price: { type: Number, required: true, min: 0, index: true },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, required: true, uppercase: true, default: 'USD' },
    stock: { type: Number, required: true, min: 0, default: 1 },
    status: {
      type: String,
      enum: ['draft', 'available', 'reserved', 'sold', 'archived'],
      default: 'draft',
      index: true,
    },
    images: { type: [catImageSchema], default: [] },
    attributes: { type: Map, of: String },
    vaccinated: { type: Boolean, default: false },
    neutered: { type: Boolean, default: false },
    pedigree: { type: Boolean, default: false },
    featured: { type: Boolean, default: false, index: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'cats' },
);

catSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });
catSchema.index({ status: 1, featured: -1, createdAt: -1 });
catSchema.index({ category: 1, status: 1, price: 1 });
catSchema.index({ breed: 1, status: 1 });

export const CatModel = model<ICat>('Cat', catSchema);
