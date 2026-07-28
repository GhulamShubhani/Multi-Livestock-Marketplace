import { AppError } from '../../../utils/AppError';
import { catRepository } from '../../cat/repository/cat.repository';
import { wishlistRepository } from '../repository/wishlist.repository';

export class WishlistService {
  async get(userId: string) {
    const wishlist = await wishlistRepository.findByUser(userId);
    return wishlist ?? { user: userId, items: [] };
  }

  async add(userId: string, catId: string) {
    const cat = await catRepository.findById(catId);
    if (!cat || cat.status !== 'available') {
      throw AppError.badRequest('Cat is not available');
    }

    const wishlist = await wishlistRepository.findOrCreate(userId);
    const exists = wishlist.items.some((i) => String(i.cat) === catId);
    if (!exists) {
      wishlist.items.push({ cat: cat._id as never, addedAt: new Date() });
      await wishlistRepository.save(wishlist);
    }

    return wishlistRepository.findByUser(userId);
  }

  async remove(userId: string, catId: string) {
    const wishlist = await wishlistRepository.findOrCreate(userId);
    wishlist.items = wishlist.items.filter((i) => String(i.cat) !== catId) as typeof wishlist.items;
    await wishlistRepository.save(wishlist);
    return wishlistRepository.findByUser(userId);
  }
}

export const wishlistService = new WishlistService();
