import { AppError } from '../../../utils/AppError';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { bannerRepository } from '../repository/banner.repository';
import type { BannerPlacement, IBanner } from '../interface/banner.interface';
import type { MediaAsset } from '../../../types/media';

export interface BannerInput {
  title: string;
  image: MediaAsset;
  linkUrl?: string;
  placement: BannerPlacement;
  sortOrder?: number;
  isActive?: boolean;
  startsAt?: string | Date;
  endsAt?: string | Date;
}

export class BannerService {
  async listPublic(placement?: string) {
    return bannerRepository.listActive(placement);
  }

  async listAdmin(query: Record<string, unknown>) {
    return bannerRepository.listAdmin(query);
  }

  async getById(id: string) {
    const banner = await bannerRepository.findById(id);
    if (!banner) throw AppError.notFound('Banner not found');
    return banner;
  }

  async create(dto: BannerInput, actorId: string) {
    if (!dto.image?.url || !dto.image?.publicId) {
      throw AppError.badRequest('Banner image is required');
    }

    const banner = await bannerRepository.create({
      title: dto.title.trim(),
      image: dto.image,
      linkUrl: dto.linkUrl,
      placement: dto.placement,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
    });

    await activityLogService.log({
      actor: actorId,
      action: 'banners.create',
      module: 'banners',
      resourceId: banner._id,
    });
    return banner;
  }

  async update(id: string, dto: Partial<BannerInput>, actorId: string) {
    const existing = await bannerRepository.findById(id);
    if (!existing) throw AppError.notFound('Banner not found');

    const update: Partial<IBanner> = {};
    if (dto.title !== undefined) update.title = dto.title.trim();
    if (dto.image !== undefined) update.image = dto.image;
    if (dto.linkUrl !== undefined) update.linkUrl = dto.linkUrl;
    if (dto.placement !== undefined) update.placement = dto.placement;
    if (dto.sortOrder !== undefined) update.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    if (dto.startsAt !== undefined) update.startsAt = new Date(dto.startsAt);
    if (dto.endsAt !== undefined) update.endsAt = new Date(dto.endsAt);

    const banner = await bannerRepository.updateById(id, update);
    await activityLogService.log({
      actor: actorId,
      action: 'banners.update',
      module: 'banners',
      resourceId: id,
    });
    return banner;
  }

  async remove(id: string, actorId: string) {
    const deleted = await bannerRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('Banner not found');
    await activityLogService.log({
      actor: actorId,
      action: 'banners.delete',
      module: 'banners',
      resourceId: id,
      severity: 'warn',
    });
  }
}

export const bannerService = new BannerService();
