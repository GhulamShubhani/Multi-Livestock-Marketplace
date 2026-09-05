import type { Document, Types } from 'mongoose';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface IReview {
  listing: Types.ObjectId;
  user: Types.ObjectId;
  order?: Types.ObjectId;
  rating: number;
  title?: string;
  body?: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewDocument = Document<Types.ObjectId> & IReview;
