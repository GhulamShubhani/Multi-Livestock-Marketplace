import { AppError } from '../../../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { ensureUniqueSlug, slugify } from '../../../utils/slug';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { categoryRepository } from '../repository/category.repository';
import type { ICategory } from '../interface/category.interface';
import type { MediaAsset, SeoFields } from '../../../types/media';

export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image?: MediaAsset;
  icon?: string;
  group?: string;
  parent?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  seo?: SeoFields;
}

export class CategoryService {
  async listPublic(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const { items, total } = await categoryRepository.list({
      activeOnly: true,
      skip,
      limit,
      q: typeof query.q === 'string' ? query.q : undefined,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async listAdmin(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const activeOnly =
      query.active === 'true' ? true : query.active === 'false' ? false : undefined;
    const filterActive = activeOnly === undefined ? undefined : activeOnly;
    const { items, total } = await categoryRepository.list({
      activeOnly: filterActive,
      skip,
      limit,
      q: typeof query.q === 'string' ? query.q : undefined,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async getBySlug(slug: string, activeOnly = true) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category || (activeOnly && !category.isActive)) {
      throw AppError.notFound('Category not found');
    }
    return category;
  }

  async getById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw AppError.notFound('Category not found');
    return category;
  }

  async create(dto: CategoryInput, actorId: string) {
    const baseSlug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const slug = await ensureUniqueSlug(baseSlug, (s) => categoryRepository.slugExists(s));

    if (dto.parent) {
      const parent = await categoryRepository.findById(dto.parent);
      if (!parent) throw AppError.badRequest('Parent category not found');
    }

    const category = await categoryRepository.create({
      name: dto.name.trim(),
      slug,
      description: dto.description,
      image: dto.image,
      icon: dto.icon,
      group: dto.group,
      parent: dto.parent || undefined,
      listingCount: 0,
      attributes: [],
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      seo: dto.seo,
    } as Partial<ICategory>);

    await activityLogService.log({
      actor: actorId,
      action: 'categories.create',
      module: 'categories',
      resourceType: 'category',
      resourceId: category._id,
    });

    return category;
  }

  async update(id: string, dto: Partial<CategoryInput>, actorId: string) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw AppError.notFound('Category not found');

    const update: Partial<ICategory> = {};
    if (dto.name !== undefined) update.name = dto.name.trim();
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.image !== undefined) update.image = dto.image;
    if (dto.icon !== undefined) update.icon = dto.icon;
    if (dto.group !== undefined) update.group = dto.group;
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) update.sortOrder = dto.sortOrder;
    if (dto.seo !== undefined) update.seo = dto.seo;
    if (dto.parent !== undefined) {
      if (dto.parent === null || dto.parent === '') {
        update.parent = undefined;
      } else {
        if (dto.parent === id) throw AppError.badRequest('Category cannot be its own parent');
        const parent = await categoryRepository.findById(dto.parent);
        if (!parent) throw AppError.badRequest('Parent category not found');
        update.parent = parent._id as ICategory['parent'];
      }
    }
    if (dto.slug !== undefined || dto.name !== undefined) {
      const base = dto.slug ? slugify(dto.slug) : slugify(dto.name ?? existing.name);
      update.slug = await ensureUniqueSlug(base, (s) => categoryRepository.slugExists(s, id));
    }

    const category = await categoryRepository.updateById(id, update);
    await activityLogService.log({
      actor: actorId,
      action: 'categories.update',
      module: 'categories',
      resourceType: 'category',
      resourceId: id,
    });
    return category;
  }

  async remove(id: string, actorId: string) {
    const deleted = await categoryRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('Category not found');
    await activityLogService.log({
      actor: actorId,
      action: 'categories.delete',
      module: 'categories',
      resourceType: 'category',
      resourceId: id,
      severity: 'warn',
    });
  }
}

export const categoryService = new CategoryService();
