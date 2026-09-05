import type { FilterQuery } from 'mongoose';
import { Types } from 'mongoose';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { ReviewModel } from '../model/review.model';
import type { IReview, ReviewDocument } from '../interface/review.interface';

export class ReviewRepository {
  async create(data: Partial<IReview>): Promise<ReviewDocument> {
    return ReviewModel.create(data);
  }

  async findById(id: string): Promise<ReviewDocument | null> {
    return ReviewModel.findById(id).populate('user', 'firstName lastName').exec();
  }

  async findByListingAndUser(listingId: string, userId: string): Promise<ReviewDocument | null> {
    return ReviewModel.findOne({ listing: listingId, user: userId }).exec();
  }

  async list(query: Record<string, unknown>, approvedOnly = false) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<IReview> = {};
    if (typeof query.listingId === 'string') filter.listing = query.listingId;
    if (approvedOnly) filter.status = 'approved';
    else if (typeof query.status === 'string') filter.status = query.status as IReview['status'];

    const [items, total] = await Promise.all([
      ReviewModel.find(filter)
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      ReviewModel.countDocuments(filter).exec(),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async updateById(id: string, data: Partial<IReview>): Promise<ReviewDocument | null> {
    return ReviewModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    return Boolean(await ReviewModel.findByIdAndDelete(id).exec());
  }

  async aggregateRatings(listingId: string): Promise<{ average: number; count: number }> {
    const [result] = await ReviewModel.aggregate<{ average: number; count: number }>([
      { $match: { listing: new Types.ObjectId(listingId), status: 'approved' } },
      {
        $group: {
          _id: '$listing',
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]).exec();

    return {
      average: result ? Math.round(result.average * 10) / 10 : 0,
      count: result?.count ?? 0,
    };
  }
}

export const reviewRepository = new ReviewRepository();
