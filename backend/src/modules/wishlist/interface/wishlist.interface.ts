import type { Document, Types } from 'mongoose';

export interface IWishlistItem {
  listing: Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist {
  user: Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type WishlistDocument = Document<Types.ObjectId> & IWishlist;
