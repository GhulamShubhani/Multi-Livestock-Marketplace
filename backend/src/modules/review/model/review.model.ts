import { Schema, model } from 'mongoose';
import type { IReview } from '../interface/review.interface';

const reviewSchema = new Schema<IReview>(
  {
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 120 },
    body: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true, collection: 'reviews' },
);

reviewSchema.index({ listing: 1, user: 1 }, { unique: true });

export const ReviewModel = model<IReview>('Review', reviewSchema);
