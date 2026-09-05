import { Schema, model } from 'mongoose';
import type { IListing } from '../interface/listing.interface';

const listingImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    alt: { type: String },
  },
  { _id: false },
);

const listingVideoSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String },
  },
  { _id: false },
);

const locationSchema = new Schema(
  {
    country: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true, index: true },
    district: { type: String, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    village: { type: String, trim: true },
    area: { type: String, trim: true },
    pincode: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false },
);

const listingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    listingId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategory: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    breed: { type: Schema.Types.ObjectId, ref: 'Breed', index: true },
    price: { type: Number, required: true, min: 0, index: true },
    negotiable: { type: Boolean, default: false },
    currency: { type: String, required: true, uppercase: true, default: 'INR' },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sellerMobile: { type: String, trim: true },
    sellerWhatsApp: { type: String, trim: true },
    location: { type: locationSchema, required: true },
    images: { type: [listingImageSchema], default: [] },
    videos: { type: [listingVideoSchema], default: [] },
    ageMonths: { type: Number, min: 0 },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    weight: { type: Number, min: 0 },
    healthStatus: { type: String, trim: true },
    vaccinationStatus: { type: String, trim: true },
    availabilityStatus: {
      type: String,
      enum: ['draft', 'available', 'reserved', 'sold', 'archived'],
      default: 'draft',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    premium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    attributes: { type: Schema.Types.Mixed, default: {} },
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
  { timestamps: true, collection: 'listings' },
);

listingSchema.index({ title: 'text', description: 'text', shortDescription: 'text' });
listingSchema.index({ availabilityStatus: 1, featured: -1, createdAt: -1 });
listingSchema.index({ category: 1, availabilityStatus: 1, price: 1 });
listingSchema.index({ 'location.state': 1, 'location.city': 1 });
listingSchema.index({ seller: 1, availabilityStatus: 1 });
listingSchema.index({ verificationStatus: 1, createdAt: -1 });

export const ListingModel = model<IListing>('Listing', listingSchema);
