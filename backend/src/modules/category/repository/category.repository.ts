import type { FilterQuery } from 'mongoose';
import { CategoryModel } from '../model/category.model';
import type { CategoryDocument, ICategory } from '../interface/category.interface';

export class CategoryRepository {
  async create(data: Partial<ICategory>): Promise<CategoryDocument> {
    return CategoryModel.create(data);
  }

  async findById(id: string): Promise<CategoryDocument | null> {
    return CategoryModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    return CategoryModel.findOne({ slug }).exec();
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<ICategory> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    return Boolean(await CategoryModel.exists(filter));
  }

  async list(params: {
    activeOnly?: boolean;
    skip: number;
    limit: number;
    q?: string;
  }): Promise<{ items: CategoryDocument[]; total: number }> {
    const query: FilterQuery<ICategory> = {};
    if (params.activeOnly) query.isActive = true;
    if (params.q) {
      query.$or = [
        { name: { $regex: params.q, $options: 'i' } },
        { slug: { $regex: params.q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      CategoryModel.find(query).sort({ sortOrder: 1, name: 1 }).skip(params.skip).limit(params.limit).exec(),
      CategoryModel.countDocuments(query).exec(),
    ]);
    return { items, total };
  }

  async updateById(id: string, data: Partial<ICategory>): Promise<CategoryDocument | null> {
    return CategoryModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }
}

export const categoryRepository = new CategoryRepository();
