import { Schema, model } from 'mongoose';
import type { IBreed } from '../interface/breed.interface';

const breedSchema = new Schema<IBreed>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    origin: { type: String, trim: true },
    temperament: [{ type: String, trim: true }],
    lifeSpan: { type: String, trim: true },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category', index: true }],
    image: {
      url: String,
      publicId: String,
    },
    isActive: { type: Boolean, default: true, index: true },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  { timestamps: true, collection: 'breeds' },
);

export const BreedModel = model<IBreed>('Breed', breedSchema);
