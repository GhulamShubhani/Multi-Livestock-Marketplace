import { WishlistModel } from '../model/wishlist.model';
import type { WishlistDocument } from '../interface/wishlist.interface';

export class WishlistRepository {
  async findByUser(userId: string): Promise<WishlistDocument | null> {
    return WishlistModel.findOne({ user: userId }).populate('items.listing').exec();
  }

  async findOrCreate(userId: string): Promise<WishlistDocument> {
    let wishlist = await WishlistModel.findOne({ user: userId }).exec();
    if (!wishlist) {
      wishlist = await WishlistModel.create({ user: userId, items: [] });
    }
    return wishlist;
  }

  async save(doc: WishlistDocument): Promise<WishlistDocument> {
    return doc.save();
  }
}

export const wishlistRepository = new WishlistRepository();
