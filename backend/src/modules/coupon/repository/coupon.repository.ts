import { CouponModel } from '../model/coupon.model';
import type { CouponDocument, ICoupon } from '../interface/coupon.interface';
import type { FilterQuery } from 'mongoose';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';

export class CouponRepository {
  async create(data: Partial<ICoupon>): Promise<CouponDocument> {
    return CouponModel.create(data);
  }

  async findByCode(code: string): Promise<CouponDocument | null> {
    return CouponModel.findOne({ code: code.toUpperCase() }).exec();
  }

  async findById(id: string): Promise<CouponDocument | null> {
    return CouponModel.findById(id).exec();
  }

  async list(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<ICoupon> = {};
    if (query.active === 'true') filter.isActive = true;
    if (query.active === 'false') filter.isActive = false;
    if (typeof query.q === 'string' && query.q) {
      filter.code = { $regex: query.q, $options: 'i' };
    }
    const [items, total] = await Promise.all([
      CouponModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      CouponModel.countDocuments(filter).exec(),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async updateById(id: string, data: Partial<ICoupon>): Promise<CouponDocument | null> {
    return CouponModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    return Boolean(await CouponModel.findByIdAndDelete(id).exec());
  }

  async incrementUsed(id: string): Promise<void> {
    await CouponModel.updateOne({ _id: id }, { $inc: { usedCount: 1 } }).exec();
  }
}

export const couponRepository = new CouponRepository();
