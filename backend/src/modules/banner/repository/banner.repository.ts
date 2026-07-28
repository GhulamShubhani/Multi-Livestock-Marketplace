import type { FilterQuery } from 'mongoose';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { BannerModel } from '../model/banner.model';
import type { BannerDocument, IBanner } from '../interface/banner.interface';

export class BannerRepository {
  async create(data: Partial<IBanner>): Promise<BannerDocument> {
    return BannerModel.create(data);
  }

  async findById(id: string): Promise<BannerDocument | null> {
    return BannerModel.findById(id).exec();
  }

  async listActive(placement?: string) {
    const now = new Date();
    const filter: FilterQuery<IBanner> = {
      isActive: true,
      $and: [
        { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: now } }] },
      ],
    };
    if (placement) filter.placement = placement as IBanner['placement'];
    return BannerModel.find(filter).sort({ sortOrder: 1, createdAt: -1 }).exec();
  }

  async listAdmin(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<IBanner> = {};
    if (typeof query.placement === 'string') filter.placement = query.placement as IBanner['placement'];
    if (query.active === 'true') filter.isActive = true;
    if (query.active === 'false') filter.isActive = false;

    const [items, total] = await Promise.all([
      BannerModel.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).exec(),
      BannerModel.countDocuments(filter).exec(),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async updateById(id: string, data: Partial<IBanner>): Promise<BannerDocument | null> {
    return BannerModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    return Boolean(await BannerModel.findByIdAndDelete(id).exec());
  }
}

export const bannerRepository = new BannerRepository();
