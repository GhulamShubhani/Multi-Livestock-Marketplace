import type { FilterQuery } from 'mongoose';
import { EnquiryModel } from '../model/enquiry.model';
import type { EnquiryDocument, IEnquiry } from '../interface/enquiry.interface';

export class EnquiryRepository {
  async create(data: Partial<IEnquiry>): Promise<EnquiryDocument> {
    return EnquiryModel.create(data);
  }

  async findById(id: string): Promise<EnquiryDocument | null> {
    return EnquiryModel.findById(id)
      .populate('listingId')
      .populate('buyerId', 'email firstName lastName phone')
      .populate('sellerId', 'email firstName lastName phone')
      .exec();
  }

  async list(params: {
    skip: number;
    limit: number;
    buyerId?: string;
    sellerId?: string;
    listingId?: string;
    status?: string;
  }): Promise<{ items: EnquiryDocument[]; total: number }> {
    const query: FilterQuery<IEnquiry> = {};
    if (params.buyerId) query.buyerId = params.buyerId;
    if (params.sellerId) query.sellerId = params.sellerId;
    if (params.listingId) query.listingId = params.listingId;
    if (params.status) query.status = params.status;

    const [items, total] = await Promise.all([
      EnquiryModel.find(query)
        .populate('listingId')
        .populate('buyerId', 'email firstName lastName phone')
        .populate('sellerId', 'email firstName lastName phone')
        .sort({ createdAt: -1 })
        .skip(params.skip)
        .limit(params.limit)
        .exec(),
      EnquiryModel.countDocuments(query).exec(),
    ]);
    return { items, total };
  }

  async updateById(id: string, data: Partial<IEnquiry>): Promise<EnquiryDocument | null> {
    return EnquiryModel.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate('listingId')
      .populate('buyerId', 'email firstName lastName phone')
      .populate('sellerId', 'email firstName lastName phone')
      .exec();
  }
}

export const enquiryRepository = new EnquiryRepository();
