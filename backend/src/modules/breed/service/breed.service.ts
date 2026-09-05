import { Types } from 'mongoose';
import { AppError } from '../../../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { ensureUniqueSlug, slugify } from '../../../utils/slug';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { breedRepository } from '../repository/breed.repository';
import type { IBreed } from '../interface/breed.interface';
import type { MediaAsset, SeoFields } from '../../../types/media';

export interface BreedInput {
  name: string;
  slug?: string;
  description?: string;
  origin?: string;
  temperament?: string[];
  lifeSpan?: string;
  categoryIds?: string[];
  image?: MediaAsset;
  isActive?: boolean;
  seo?: SeoFields;
}

export class BreedService {
  async listPublic(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const { items, total } = await breedRepository.list({
      activeOnly: true,
      skip,
      limit,
      q: typeof query.q === 'string' ? query.q : undefined,
      categoryId: typeof query.categoryId === 'string' ? query.categoryId : undefined,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async listAdmin(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const activeOnly =
      query.active === 'true' ? true : query.active === 'false' ? false : undefined;
    const { items, total } = await breedRepository.list({
      activeOnly,
      skip,
      limit,
      q: typeof query.q === 'string' ? query.q : undefined,
      categoryId: typeof query.categoryId === 'string' ? query.categoryId : undefined,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async getBySlug(slug: string, activeOnly = true) {
    const breed = await breedRepository.findBySlug(slug);
    if (!breed || (activeOnly && !breed.isActive)) {
      throw AppError.notFound('Breed not found');
    }
    return breed;
  }

  async getById(id: string) {
    const breed = await breedRepository.findById(id);
    if (!breed) throw AppError.notFound('Breed not found');
    return breed;
  }

  async create(dto: BreedInput, actorId: string) {
    const baseSlug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const slug = await ensureUniqueSlug(baseSlug, (s) => breedRepository.slugExists(s));

    const breed = await breedRepository.create({
      name: dto.name.trim(),
      slug,
      description: dto.description,
      origin: dto.origin,
      temperament: dto.temperament,
      lifeSpan: dto.lifeSpan,
      categoryIds: (dto.categoryIds ?? []).map((id) => new Types.ObjectId(id)),
      image: dto.image,
      isActive: dto.isActive ?? true,
      seo: dto.seo,
    });

    await activityLogService.log({
      actor: actorId,
      action: 'breeds.create',
      module: 'breeds',
      resourceType: 'breed',
      resourceId: breed._id,
    });

    return breed;
  }

  async update(id: string, dto: Partial<BreedInput>, actorId: string) {
    const existing = await breedRepository.findById(id);
    if (!existing) throw AppError.notFound('Breed not found');

    const update: Partial<IBreed> = {};
    if (dto.name !== undefined) update.name = dto.name.trim();
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.origin !== undefined) update.origin = dto.origin;
    if (dto.temperament !== undefined) update.temperament = dto.temperament;
    if (dto.lifeSpan !== undefined) update.lifeSpan = dto.lifeSpan;
    if (dto.categoryIds !== undefined) {
      update.categoryIds = dto.categoryIds.map((id) => new Types.ObjectId(id));
    }
    if (dto.image !== undefined) update.image = dto.image;
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    if (dto.seo !== undefined) update.seo = dto.seo;
    if (dto.slug !== undefined || dto.name !== undefined) {
      const base = dto.slug ? slugify(dto.slug) : slugify(dto.name ?? existing.name);
      update.slug = await ensureUniqueSlug(base, (s) => breedRepository.slugExists(s, id));
    }

    const breed = await breedRepository.updateById(id, update);
    await activityLogService.log({
      actor: actorId,
      action: 'breeds.update',
      module: 'breeds',
      resourceType: 'breed',
      resourceId: id,
    });
    return breed;
  }

  async remove(id: string, actorId: string) {
    const deleted = await breedRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('Breed not found');
    await activityLogService.log({
      actor: actorId,
      action: 'breeds.delete',
      module: 'breeds',
      resourceType: 'breed',
      resourceId: id,
      severity: 'warn',
    });
  }
}

export const breedService = new BreedService();
