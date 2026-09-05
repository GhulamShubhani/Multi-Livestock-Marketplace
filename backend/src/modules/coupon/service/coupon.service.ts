import { AppError } from '../../../utils/AppError';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { couponRepository } from '../repository/coupon.repository';
import type { CouponDocument, CouponType, ICoupon } from '../interface/coupon.interface';

export interface CouponInput {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startsAt?: string | Date;
  endsAt?: string | Date;
  isActive?: boolean;
  applicableCategories?: string[];
  applicableListings?: string[];
}

export interface CouponValidationResult {
  coupon: CouponDocument;
  discount: number;
}

export class CouponService {
  async list(query: Record<string, unknown>) {
    return couponRepository.list(query);
  }

  async create(dto: CouponInput, actorId: string) {
    const existing = await couponRepository.findByCode(dto.code);
    if (existing) throw AppError.conflict('Coupon code already exists');
    if (dto.type === 'percent' && (dto.value <= 0 || dto.value > 100)) {
      throw AppError.badRequest('Percent coupon value must be between 1 and 100');
    }

    const coupon = await couponRepository.create({
      code: dto.code.toUpperCase().trim(),
      type: dto.type,
      value: dto.value,
      minOrderAmount: dto.minOrderAmount,
      maxDiscount: dto.maxDiscount,
      usageLimit: dto.usageLimit,
      perUserLimit: dto.perUserLimit,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      isActive: dto.isActive ?? true,
      applicableCategories: dto.applicableCategories as never,
      applicableListings: dto.applicableListings as never,
    });

    await activityLogService.log({
      actor: actorId,
      action: 'coupons.create',
      module: 'coupons',
      resourceId: coupon._id,
    });
    return coupon;
  }

  async update(id: string, dto: Partial<CouponInput>, actorId: string) {
    const update: Partial<ICoupon> = {};
    if (dto.code !== undefined) update.code = dto.code.toUpperCase().trim();
    if (dto.type !== undefined) update.type = dto.type;
    if (dto.value !== undefined) update.value = dto.value;
    if (dto.minOrderAmount !== undefined) update.minOrderAmount = dto.minOrderAmount;
    if (dto.maxDiscount !== undefined) update.maxDiscount = dto.maxDiscount;
    if (dto.usageLimit !== undefined) update.usageLimit = dto.usageLimit;
    if (dto.perUserLimit !== undefined) update.perUserLimit = dto.perUserLimit;
    if (dto.startsAt !== undefined) update.startsAt = new Date(dto.startsAt);
    if (dto.endsAt !== undefined) update.endsAt = new Date(dto.endsAt);
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    if (dto.applicableCategories !== undefined) {
      update.applicableCategories = dto.applicableCategories as never;
    }
    if (dto.applicableListings !== undefined) {
      update.applicableListings = dto.applicableListings as never;
    }

    const coupon = await couponRepository.updateById(id, update);
    if (!coupon) throw AppError.notFound('Coupon not found');
    await activityLogService.log({
      actor: actorId,
      action: 'coupons.update',
      module: 'coupons',
      resourceId: id,
    });
    return coupon;
  }

  async remove(id: string, actorId: string) {
    const deleted = await couponRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('Coupon not found');
    await activityLogService.log({
      actor: actorId,
      action: 'coupons.delete',
      module: 'coupons',
      resourceId: id,
      severity: 'warn',
    });
  }

  async validateForOrder(
    code: string,
    subtotal: number,
    listingIds: string[],
    categoryIds: string[],
  ): Promise<CouponValidationResult> {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon || !coupon.isActive) {
      throw AppError.badRequest('Invalid coupon');
    }

    const now = Date.now();
    if (coupon.startsAt && coupon.startsAt.getTime() > now) {
      throw AppError.badRequest('Coupon is not active yet');
    }
    if (coupon.endsAt && coupon.endsAt.getTime() < now) {
      throw AppError.badRequest('Coupon has expired');
    }
    if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      throw AppError.badRequest('Coupon usage limit reached');
    }
    if (coupon.minOrderAmount !== undefined && subtotal < coupon.minOrderAmount) {
      throw AppError.badRequest('Order does not meet coupon minimum');
    }

    if (coupon.applicableListings?.length) {
      const allowed = new Set(coupon.applicableListings.map(String));
      if (!listingIds.some((id) => allowed.has(id))) {
        throw AppError.badRequest('Coupon not applicable to these items');
      }
    }
    if (coupon.applicableCategories?.length) {
      const allowed = new Set(coupon.applicableCategories.map(String));
      if (!categoryIds.some((id) => allowed.has(id))) {
        throw AppError.badRequest('Coupon not applicable to these categories');
      }
    }

    let discount =
      coupon.type === 'percent' ? Math.floor((subtotal * coupon.value) / 100) : coupon.value;

    if (coupon.maxDiscount !== undefined) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(discount, subtotal);

    return { coupon, discount };
  }
}

export const couponService = new CouponService();
