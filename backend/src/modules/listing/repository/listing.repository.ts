import type { FilterQuery } from 'mongoose';
import { ListingModel } from '../model/listing.model';
import type {
  AvailabilityStatus,
  IListing,
  ListingDocument,
  VerificationStatus,
} from '../interface/listing.interface';

export interface ListingListFilter {
  q?: string;
  availabilityStatus?: AvailabilityStatus | AvailabilityStatus[];
  verificationStatus?: VerificationStatus;
  breed?: string;
  category?: string;
  seller?: string;
  gender?: string;
  featured?: boolean;
  isActive?: boolean;
  state?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  skip: number;
  limit: number;
  sort?: string;
}

function parseSort(sort?: string): Record<string, 1 | -1> {
  if (!sort) return { createdAt: -1 };
  const [field, dir] = sort.includes(':')
    ? sort.split(':')
    : [sort.replace(/^-/, ''), sort.startsWith('-') ? 'desc' : 'asc'];
  const allowed = new Set(['createdAt', 'price', 'title', 'featured', 'averageRating']);
  if (!allowed.has(field)) return { createdAt: -1 };
  return { [field]: dir === 'asc' || dir === '1' ? 1 : -1 };
}

export class ListingRepository {
  async create(data: Partial<IListing>): Promise<ListingDocument> {
    return ListingModel.create(data);
  }

  async findById(id: string): Promise<ListingDocument | null> {
    return ListingModel.findById(id).populate('breed category subcategory seller').exec();
  }

  async findBySlug(slug: string): Promise<ListingDocument | null> {
    return ListingModel.findOne({ slug }).populate('breed category subcategory seller').exec();
  }

  async findByListingId(listingId: string): Promise<ListingDocument | null> {
    return ListingModel.findOne({ listingId: listingId.toUpperCase() })
      .populate('breed category subcategory seller')
      .exec();
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<IListing> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    return Boolean(await ListingModel.exists(filter));
  }

  async listingIdExists(listingId: string): Promise<boolean> {
    return Boolean(await ListingModel.exists({ listingId: listingId.toUpperCase() }));
  }

  async list(filter: ListingListFilter): Promise<{ items: ListingDocument[]; total: number }> {
    const query: FilterQuery<IListing> = {};

    if (filter.availabilityStatus) {
      query.availabilityStatus = Array.isArray(filter.availabilityStatus)
        ? { $in: filter.availabilityStatus }
        : filter.availabilityStatus;
    }
    if (filter.verificationStatus) query.verificationStatus = filter.verificationStatus;
    if (filter.breed) query.breed = filter.breed;
    if (filter.category) query.category = filter.category;
    if (filter.seller) query.seller = filter.seller;
    if (filter.gender) query.gender = filter.gender;
    if (filter.featured !== undefined) query.featured = filter.featured;
    if (filter.isActive !== undefined) query.isActive = filter.isActive;
    if (filter.state) query['location.state'] = filter.state;
    if (filter.city) query['location.city'] = filter.city;
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      query.price = {};
      if (filter.minPrice !== undefined)
        (query.price as Record<string, number>).$gte = filter.minPrice;
      if (filter.maxPrice !== undefined)
        (query.price as Record<string, number>).$lte = filter.maxPrice;
    }
    if (filter.q) {
      query.$text = { $search: filter.q };
    }

    const sort = parseSort(filter.sort);

    const [items, total] = await Promise.all([
      ListingModel.find(query)
        .populate('breed category subcategory seller')
        .sort(sort)
        .skip(filter.skip)
        .limit(filter.limit)
        .exec(),
      ListingModel.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async updateById(id: string, data: Partial<IListing>): Promise<ListingDocument | null> {
    return ListingModel.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate('breed category subcategory seller')
      .exec();
  }

  async incrementCategoryCount(categoryId: string, delta: number): Promise<void> {
    const { CategoryModel } = await import('../../category/model/category.model');
    await CategoryModel.updateOne({ _id: categoryId }, { $inc: { listingCount: delta } }).exec();
  }

  async deleteById(id: string): Promise<ListingDocument | null> {
    return ListingModel.findByIdAndDelete(id).exec();
  }
}

export const listingRepository = new ListingRepository();
