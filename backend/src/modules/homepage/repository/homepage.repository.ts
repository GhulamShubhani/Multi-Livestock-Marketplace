import type { FilterQuery } from 'mongoose';
import { HomepageSectionModel } from '../model/homepage.model';
import type { HomepageSectionDocument, IHomepageSection } from '../interface/homepage.interface';

export class HomepageRepository {
  async create(data: Partial<IHomepageSection>): Promise<HomepageSectionDocument> {
    return HomepageSectionModel.create(data);
  }

  async findById(id: string): Promise<HomepageSectionDocument | null> {
    return HomepageSectionModel.findById(id).populate('category').exec();
  }

  async findByKey(key: string): Promise<HomepageSectionDocument | null> {
    return HomepageSectionModel.findOne({ key: key.toLowerCase() }).exec();
  }

  async listActive(): Promise<HomepageSectionDocument[]> {
    return HomepageSectionModel.find({ isActive: true })
      .populate('category')
      .sort({ displayOrder: 1, createdAt: 1 })
      .exec();
  }

  async list(params: {
    skip: number;
    limit: number;
    activeOnly?: boolean;
  }): Promise<{ items: HomepageSectionDocument[]; total: number }> {
    const query: FilterQuery<IHomepageSection> = {};
    if (params.activeOnly) query.isActive = true;

    const [items, total] = await Promise.all([
      HomepageSectionModel.find(query)
        .populate('category')
        .sort({ displayOrder: 1, createdAt: 1 })
        .skip(params.skip)
        .limit(params.limit)
        .exec(),
      HomepageSectionModel.countDocuments(query).exec(),
    ]);
    return { items, total };
  }

  async updateById(
    id: string,
    data: Partial<IHomepageSection>,
  ): Promise<HomepageSectionDocument | null> {
    return HomepageSectionModel.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate('category')
      .exec();
  }

  async reorder(items: Array<{ id: string; displayOrder: number }>): Promise<void> {
    await Promise.all(
      items.map((item) =>
        HomepageSectionModel.updateOne(
          { _id: item.id },
          { $set: { displayOrder: item.displayOrder } },
        ).exec(),
      ),
    );
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await HomepageSectionModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }
}

export const homepageRepository = new HomepageRepository();
