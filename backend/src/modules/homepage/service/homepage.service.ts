import { Types } from 'mongoose';
import { AppError } from '../../../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { homepageRepository } from '../repository/homepage.repository';
import type { HomepageSectionType, IHomepageSection } from '../interface/homepage.interface';
import type { MediaAsset } from '../../../types/media';

export interface HomepageSectionInput {
  key: string;
  type: HomepageSectionType;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: MediaAsset;
  ctaText?: string;
  ctaUrl?: string;
  category?: string;
  displayOrder?: number;
  isActive?: boolean;
  config?: Record<string, unknown>;
}

export class HomepageService {
  async listPublic() {
    return homepageRepository.listActive();
  }

  async listAdmin(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const { items, total } = await homepageRepository.list({
      skip,
      limit,
      activeOnly: query.active === 'true' ? true : query.active === 'false' ? false : undefined,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async getById(id: string) {
    const section = await homepageRepository.findById(id);
    if (!section) throw AppError.notFound('Homepage section not found');
    return section;
  }

  async create(dto: HomepageSectionInput, actorId: string) {
    const key = dto.key.trim().toLowerCase();
    const existing = await homepageRepository.findByKey(key);
    if (existing) throw AppError.conflict('Homepage section key already exists');

    const section = await homepageRepository.create({
      key,
      type: dto.type,
      title: dto.title,
      subtitle: dto.subtitle,
      description: dto.description,
      image: dto.image,
      ctaText: dto.ctaText,
      ctaUrl: dto.ctaUrl,
      category: dto.category ? new Types.ObjectId(dto.category) : undefined,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
      config: dto.config ?? {},
    });

    await activityLogService.log({
      actor: actorId,
      action: 'homepage.create',
      module: 'homepage',
      resourceId: section._id,
    });

    return homepageRepository.findById(String(section._id));
  }

  async update(id: string, dto: Partial<HomepageSectionInput>, actorId: string) {
    const update: Partial<IHomepageSection> = {};
    if (dto.key !== undefined) update.key = dto.key.trim().toLowerCase();
    if (dto.type !== undefined) update.type = dto.type;
    if (dto.title !== undefined) update.title = dto.title;
    if (dto.subtitle !== undefined) update.subtitle = dto.subtitle;
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.image !== undefined) update.image = dto.image;
    if (dto.ctaText !== undefined) update.ctaText = dto.ctaText;
    if (dto.ctaUrl !== undefined) update.ctaUrl = dto.ctaUrl;
    if (dto.category !== undefined) {
      update.category = dto.category ? new Types.ObjectId(dto.category) : undefined;
    }
    if (dto.displayOrder !== undefined) update.displayOrder = dto.displayOrder;
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    if (dto.config !== undefined) update.config = dto.config;

    const section = await homepageRepository.updateById(id, update);
    if (!section) throw AppError.notFound('Homepage section not found');

    await activityLogService.log({
      actor: actorId,
      action: 'homepage.update',
      module: 'homepage',
      resourceId: id,
    });
    return section;
  }

  async reorder(items: Array<{ id: string; displayOrder: number }>, actorId: string) {
    if (!items?.length) throw AppError.badRequest('Reorder items required');
    await homepageRepository.reorder(items);
    await activityLogService.log({
      actor: actorId,
      action: 'homepage.reorder',
      module: 'homepage',
      metadata: { count: items.length },
    });
    return homepageRepository.listActive();
  }

  async remove(id: string, actorId: string) {
    const deleted = await homepageRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('Homepage section not found');
    await activityLogService.log({
      actor: actorId,
      action: 'homepage.delete',
      module: 'homepage',
      resourceId: id,
      severity: 'warn',
    });
  }
}

export const homepageService = new HomepageService();
