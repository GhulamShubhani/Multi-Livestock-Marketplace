import { Types } from 'mongoose';
import { AppError } from '../../../utils/AppError';
import { refId } from '../../../utils/refId';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { listingRepository } from '../../listing/repository/listing.repository';
import { orderRepository } from '../../order/repository/order.repository';
import { reviewRepository } from '../repository/review.repository';
import type { ReviewDocument, ReviewStatus } from '../interface/review.interface';

function ownerId(review: ReviewDocument): string {
  return refId(review.user);
}

export class ReviewService {
  async listPublic(query: Record<string, unknown>) {
    if (!query.listingId) throw AppError.badRequest('listingId is required');
    return reviewRepository.list(query, true);
  }

  async listAdmin(query: Record<string, unknown>) {
    return reviewRepository.list(query, false);
  }

  async create(
    userId: string,
    dto: { listingId: string; rating: number; title?: string; body?: string; orderId?: string },
  ) {
    const listing = await listingRepository.findById(dto.listingId);
    if (!listing) throw AppError.notFound('Listing not found');

    const existing = await reviewRepository.findByListingAndUser(dto.listingId, userId);
    if (existing) throw AppError.conflict('You already reviewed this listing');

    let orderRef: Types.ObjectId | undefined;
    let status: ReviewStatus = 'pending';

    if (dto.orderId) {
      const order = await orderRepository.findByIdForUser(dto.orderId, userId);
      if (!order) throw AppError.badRequest('Order not found');
      const purchased = order.items.some((i) => refId(i.listing) === dto.listingId);
      if (!purchased) throw AppError.badRequest('Listing not part of this order');
      if (order.paymentStatus !== 'paid') throw AppError.badRequest('Order is not paid');
      orderRef = order._id as Types.ObjectId;
      status = 'approved';
    }

    const review = await reviewRepository.create({
      listing: new Types.ObjectId(dto.listingId),
      user: new Types.ObjectId(userId),
      order: orderRef,
      rating: dto.rating,
      title: dto.title,
      body: dto.body,
      status,
    });

    if (status === 'approved') {
      await this.refreshListingRatings(dto.listingId);
    }

    await activityLogService.log({
      actor: userId,
      action: 'reviews.create',
      module: 'reviews',
      resourceId: review._id,
    });

    return review;
  }

  async moderate(id: string, status: ReviewStatus, actorId: string) {
    const review = await reviewRepository.updateById(id, { status });
    if (!review) throw AppError.notFound('Review not found');
    await this.refreshListingRatings(refId(review.listing));
    await activityLogService.log({
      actor: actorId,
      action: 'reviews.moderate',
      module: 'reviews',
      resourceId: id,
      metadata: { status },
    });
    return review;
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const review = await reviewRepository.findById(id);
    if (!review) throw AppError.notFound('Review not found');
    if (!isAdmin && ownerId(review) !== userId) {
      throw AppError.forbidden('Forbidden');
    }

    const listingId = refId(review.listing);
    await reviewRepository.deleteById(id);
    await this.refreshListingRatings(listingId);
  }

  private async refreshListingRatings(listingId: string) {
    const { average, count } = await reviewRepository.aggregateRatings(listingId);
    await listingRepository.updateById(listingId, {
      averageRating: average,
      reviewCount: count,
    });
  }
}

export const reviewService = new ReviewService();
