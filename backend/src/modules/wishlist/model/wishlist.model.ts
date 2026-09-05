import { Schema, model } from 'mongoose';
import type { IWishlist } from '../interface/wishlist.interface';

const wishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, collection: 'wishlists' },
);

export const WishlistModel = model<IWishlist>('Wishlist', wishlistSchema);
