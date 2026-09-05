import { AppError } from '../../../utils/AppError';
import { listingRepository } from '../../listing/repository/listing.repository';
import { wishlistRepository } from '../repository/wishlist.repository';

export class WishlistService {
  async get(userId: string) {
    const wishlist = await wishlistRepository.findByUser(userId);
    return wishlist ?? { user: userId, items: [] };
  }

  async add(userId: string, listingId: string) {
    const listing = await listingRepository.findById(listingId);
    if (!listing || listing.availabilityStatus !== 'available' || !listing.isActive) {
      throw AppError.badRequest('Listing is not available');
    }

    const wishlist = await wishlistRepository.findOrCreate(userId);
    const exists = wishlist.items.some((i) => String(i.listing) === listingId);
    if (!exists) {
      wishlist.items.push({ listing: listing._id as never, addedAt: new Date() });
      await wishlistRepository.save(wishlist);
    }

    return wishlistRepository.findByUser(userId);
  }

  async remove(userId: string, listingId: string) {
    const wishlist = await wishlistRepository.findOrCreate(userId);
    wishlist.items = wishlist.items.filter(
      (i) => String(i.listing) !== listingId,
    ) as typeof wishlist.items;
    await wishlistRepository.save(wishlist);
    return wishlistRepository.findByUser(userId);
  }
}

export const wishlistService = new WishlistService();
