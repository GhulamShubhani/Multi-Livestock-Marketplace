import { Types } from 'mongoose';
import { AppError } from '../../../utils/AppError';
import { ensureUniqueSlug, slugify } from '../../../utils/slug';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { cmsRepository } from '../repository/cms.repository';
import type { CmsStatus, ICmsPage } from '../interface/cms.interface';
import type { SeoFields } from '../../../types/media';

export interface CmsInput {
  title: string;
  slug?: string;
  content: string;
  status?: CmsStatus;
  seo?: SeoFields;
}

export class CmsService {
  async getPublishedBySlug(slug: string) {
    const page = await cmsRepository.findBySlug(slug);
    if (!page || page.status !== 'published') throw AppError.notFound('Page not found');
    return page;
  }

  async listAdmin(query: Record<string, unknown>) {
    return cmsRepository.list(query, false);
  }

  async getById(id: string) {
    const page = await cmsRepository.findById(id);
    if (!page) throw AppError.notFound('Page not found');
    return page;
  }

  async create(dto: CmsInput, actorId: string) {
    const base = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    const slug = await ensureUniqueSlug(base, (s) => cmsRepository.slugExists(s));
    const status = dto.status ?? 'draft';

    const page = await cmsRepository.create({
      title: dto.title.trim(),
      slug,
      content: dto.content,
      status,
      seo: dto.seo,
      publishedAt: status === 'published' ? new Date() : undefined,
      createdBy: new Types.ObjectId(actorId),
    });

    await activityLogService.log({
      actor: actorId,
      action: 'cms.create',
      module: 'cms',
      resourceId: page._id,
    });
    return page;
  }

  async update(id: string, dto: Partial<CmsInput>, actorId: string) {
    const existing = await cmsRepository.findById(id);
    if (!existing) throw AppError.notFound('Page not found');

    const update: Partial<ICmsPage> = { updatedBy: new Types.ObjectId(actorId) };
    if (dto.title !== undefined) update.title = dto.title.trim();
    if (dto.content !== undefined) update.content = dto.content;
    if (dto.seo !== undefined) update.seo = dto.seo;
    if (dto.status !== undefined) {
      update.status = dto.status;
      if (dto.status === 'published' && !existing.publishedAt) {
        update.publishedAt = new Date();
      }
    }
    if (dto.slug !== undefined || dto.title !== undefined) {
      const base = dto.slug ? slugify(dto.slug) : slugify(dto.title ?? existing.title);
      update.slug = await ensureUniqueSlug(base, (s) => cmsRepository.slugExists(s, id));
    }

    const page = await cmsRepository.updateById(id, update);
    await activityLogService.log({
      actor: actorId,
      action: 'cms.update',
      module: 'cms',
      resourceId: id,
    });
    return page;
  }

  async remove(id: string, actorId: string) {
    const deleted = await cmsRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('Page not found');
    await activityLogService.log({
      actor: actorId,
      action: 'cms.delete',
      module: 'cms',
      resourceId: id,
      severity: 'warn',
    });
  }
}

export const cmsService = new CmsService();
