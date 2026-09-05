import type { FilterQuery } from 'mongoose';
import { AttributeModel } from '../model/attribute.model';
import type { AttributeDocument, IAttribute } from '../interface/attribute.interface';

export interface AttributeListFilter {
  q?: string;
  categoryId?: string;
  activeOnly?: boolean;
  skip: number;
  limit: number;
}

export class AttributeRepository {
  async create(data: Partial<IAttribute>): Promise<AttributeDocument> {
    return AttributeModel.create(data);
  }

  async findById(id: string): Promise<AttributeDocument | null> {
    return AttributeModel.findById(id).populate('categoryIds').exec();
  }

  async findBySlug(slug: string): Promise<AttributeDocument | null> {
    return AttributeModel.findOne({ slug }).exec();
  }

  async findByKey(key: string, excludeId?: string): Promise<AttributeDocument | null> {
    const filter: FilterQuery<IAttribute> = { key };
    if (excludeId) filter._id = { $ne: excludeId };
    return AttributeModel.findOne(filter).exec();
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<IAttribute> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    return Boolean(await AttributeModel.exists(filter));
  }

  async listByCategory(categoryId: string, activeOnly = true): Promise<AttributeDocument[]> {
    const query: FilterQuery<IAttribute> = { categoryIds: categoryId };
    if (activeOnly) query.isActive = true;
    return AttributeModel.find(query).sort({ sortOrder: 1, label: 1 }).exec();
  }

  async list(filter: AttributeListFilter): Promise<{ items: AttributeDocument[]; total: number }> {
    const query: FilterQuery<IAttribute> = {};
    if (filter.activeOnly) query.isActive = true;
    if (filter.categoryId) query.categoryIds = filter.categoryId;
    if (filter.q) {
      query.$or = [
        { name: { $regex: filter.q, $options: 'i' } },
        { label: { $regex: filter.q, $options: 'i' } },
        { key: { $regex: filter.q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      AttributeModel.find(query)
        .populate('categoryIds')
        .sort({ sortOrder: 1, name: 1 })
        .skip(filter.skip)
        .limit(filter.limit)
        .exec(),
      AttributeModel.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async updateById(id: string, data: Partial<IAttribute>): Promise<AttributeDocument | null> {
    return AttributeModel.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate('categoryIds')
      .exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await AttributeModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }
}

export const attributeRepository = new AttributeRepository();
