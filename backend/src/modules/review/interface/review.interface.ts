import type { Document, Types } from 'mongoose';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface IReview {
  cat: Types.ObjectId;
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
