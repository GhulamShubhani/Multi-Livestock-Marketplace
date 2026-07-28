import type { FilterQuery } from 'mongoose';
import { CatModel } from '../model/cat.model';
import type { CatDocument, CatStatus, ICat } from '../interface/cat.interface';

export interface CatListFilter {
  q?: string;
  status?: CatStatus | CatStatus[];
  breed?: string;
  category?: string;
  gender?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  skip: number;
  limit: number;
  sort?: string;
}

function parseSort(sort?: string): Record<string, 1 | -1> {
  if (!sort) return { createdAt: -1 };
  const [field, dir] = sort.includes(':') ? sort.split(':') : [sort.replace(/^-/, ''), sort.startsWith('-') ? 'desc' : 'asc'];
  const allowed = new Set(['createdAt', 'price', 'name', 'featured', 'averageRating']);
  if (!allowed.has(field)) return { createdAt: -1 };
  return { [field]: dir === 'asc' || dir === '1' ? 1 : -1 };
}

export class CatRepository {
  async create(data: Partial<ICat>): Promise<CatDocument> {
    return CatModel.create(data);
  }

  async findById(id: string): Promise<CatDocument | null> {
    return CatModel.findById(id).populate('breed category').exec();
  }

  async findBySlug(slug: string): Promise<CatDocument | null> {
    return CatModel.findOne({ slug }).populate('breed category').exec();
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<ICat> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    return Boolean(await CatModel.exists(filter));
  }

  async list(filter: CatListFilter): Promise<{ items: CatDocument[]; total: number }> {
    const query: FilterQuery<ICat> = {};

    if (filter.status) {
      query.status = Array.isArray(filter.status) ? { $in: filter.status } : filter.status;
    }
    if (filter.breed) query.breed = filter.breed;
    if (filter.category) query.category = filter.category;
    if (filter.gender) query.gender = filter.gender;
    if (filter.featured !== undefined) query.featured = filter.featured;
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      query.price = {};
      if (filter.minPrice !== undefined) (query.price as Record<string, number>).$gte = filter.minPrice;
      if (filter.maxPrice !== undefined) (query.price as Record<string, number>).$lte = filter.maxPrice;
    }
    if (filter.q) {
      query.$text = { $search: filter.q };
    }

    const sort = parseSort(filter.sort);

    const [items, total] = await Promise.all([
      CatModel.find(query)
        .populate('breed category')
        .sort(sort)
        .skip(filter.skip)
        .limit(filter.limit)
        .exec(),
      CatModel.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async updateById(id: string, data: Partial<ICat>): Promise<CatDocument | null> {
    return CatModel.findByIdAndUpdate(id, { $set: data }, { new: true }).populate('breed category').exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await CatModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }
}

export const catRepository = new CatRepository();
