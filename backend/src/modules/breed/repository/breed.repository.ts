import type { FilterQuery } from 'mongoose';
import { BreedModel } from '../model/breed.model';
import type { BreedDocument, IBreed } from '../interface/breed.interface';

export class BreedRepository {
  async create(data: Partial<IBreed>): Promise<BreedDocument> {
    return BreedModel.create(data);
  }

  async findById(id: string): Promise<BreedDocument | null> {
    return BreedModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<BreedDocument | null> {
    return BreedModel.findOne({ slug }).exec();
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<IBreed> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    return Boolean(await BreedModel.exists(filter));
  }

  async list(params: {
    activeOnly?: boolean;
    skip: number;
    limit: number;
    q?: string;
  }): Promise<{ items: BreedDocument[]; total: number }> {
    const query: FilterQuery<IBreed> = {};
    if (params.activeOnly) query.isActive = true;
    if (params.q) {
      query.$or = [
        { name: { $regex: params.q, $options: 'i' } },
        { slug: { $regex: params.q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      BreedModel.find(query).sort({ name: 1 }).skip(params.skip).limit(params.limit).exec(),
      BreedModel.countDocuments(query).exec(),
    ]);
    return { items, total };
  }

  async updateById(id: string, data: Partial<IBreed>): Promise<BreedDocument | null> {
    return BreedModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await BreedModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }
}

export const breedRepository = new BreedRepository();
