import type { FilterQuery } from 'mongoose';
import { SellerModel } from '../model/seller.model';
import type { ISellerProfile, SellerDocument } from '../interface/seller.interface';

export class SellerRepository {
  async create(data: Partial<ISellerProfile>): Promise<SellerDocument> {
    return SellerModel.create(data);
  }

  async findById(id: string): Promise<SellerDocument | null> {
    return SellerModel.findById(id).populate('userId', 'email firstName lastName phone').exec();
  }

  async findByUserId(userId: string): Promise<SellerDocument | null> {
    return SellerModel.findOne({ userId })
      .populate('userId', 'email firstName lastName phone')
      .exec();
  }

  async list(params: {
    skip: number;
    limit: number;
    q?: string;
    verificationStatus?: string;
    activeOnly?: boolean;
  }): Promise<{ items: SellerDocument[]; total: number }> {
    const query: FilterQuery<ISellerProfile> = {};
    if (params.activeOnly) query.isActive = true;
    if (params.verificationStatus) query.verificationStatus = params.verificationStatus;
    if (params.q) {
      query.$or = [
        { businessName: { $regex: params.q, $options: 'i' } },
        { whatsapp: { $regex: params.q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      SellerModel.find(query)
        .populate('userId', 'email firstName lastName phone')
        .sort({ createdAt: -1 })
        .skip(params.skip)
        .limit(params.limit)
        .exec(),
      SellerModel.countDocuments(query).exec(),
    ]);
    return { items, total };
  }

  async updateById(id: string, data: Partial<ISellerProfile>): Promise<SellerDocument | null> {
    return SellerModel.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate('userId', 'email firstName lastName phone')
      .exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await SellerModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }
}

export const sellerRepository = new SellerRepository();
