import { Types } from 'mongoose';
import { AppError } from '../../../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { ensureUniqueSlug, slugify } from '../../../utils/slug';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { categoryRepository } from '../../category/repository/category.repository';
import { attributeRepository } from '../repository/attribute.repository';
import type { AttributeType, IAttribute } from '../interface/attribute.interface';
import { ATTRIBUTE_TYPES } from '../interface/attribute.interface';

export interface AttributeInput {
  name: string;
  slug?: string;
  key: string;
  label: string;
  type: AttributeType;
  unit?: string;
  options?: string[];
  required?: boolean;
  categoryIds?: string[];
  sortOrder?: number;
  isActive?: boolean;
  filterable?: boolean;
  showOnCard?: boolean;
}

function toCamelKey(input: string): string {
  const cleaned = input
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (!cleaned.length) return 'field';
  return cleaned
    .map((part, index) =>
      index === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join('');
}

export class AttributeService {
  async listPublicByCategory(categoryId: string) {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw AppError.badRequest('Valid category id required');
    }
    return attributeRepository.listByCategory(categoryId, true);
  }

  async listAdmin(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const { items, total } = await attributeRepository.list({
      q: typeof query.q === 'string' ? query.q : undefined,
      categoryId: typeof query.categoryId === 'string' ? query.categoryId : undefined,
      activeOnly:
        query.activeOnly === 'true' ? true : query.activeOnly === 'false' ? false : undefined,
      skip,
      limit,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async getById(id: string) {
    const attribute = await attributeRepository.findById(id);
    if (!attribute) throw AppError.notFound('Attribute not found');
    return attribute;
  }

  async create(dto: AttributeInput, actorId: string) {
    if (!ATTRIBUTE_TYPES.includes(dto.type)) {
      throw AppError.badRequest('Invalid attribute type');
    }

    const key = toCamelKey(dto.key || dto.name);
    const existingKey = await attributeRepository.findByKey(key);
    if (existingKey) throw AppError.conflict('Attribute key already exists');

    await this.assertCategories(dto.categoryIds);

    const baseSlug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const slug = await ensureUniqueSlug(baseSlug, (s) => attributeRepository.slugExists(s));

    const attribute = await attributeRepository.create({
      name: dto.name.trim(),
      slug,
      key,
      label: dto.label.trim(),
      type: dto.type,
      unit: dto.unit,
      options: dto.options,
      required: dto.required ?? false,
      categoryIds: (dto.categoryIds ?? []).map((id) => new Types.ObjectId(id)),
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      filterable: dto.filterable ?? false,
      showOnCard: dto.showOnCard ?? false,
    });

    await activityLogService.log({
      actor: actorId,
      action: 'attributes.create',
      module: 'attributes',
      resourceType: 'attribute',
      resourceId: attribute._id,
    });

    return attributeRepository.findById(String(attribute._id));
  }

  async update(id: string, dto: Partial<AttributeInput>, actorId: string) {
    const existing = await attributeRepository.findById(id);
    if (!existing) throw AppError.notFound('Attribute not found');

    if (dto.categoryIds) await this.assertCategories(dto.categoryIds);

    const update: Partial<IAttribute> = {};
    if (dto.name !== undefined) update.name = dto.name.trim();
    if (dto.label !== undefined) update.label = dto.label.trim();
    if (dto.type !== undefined) {
      if (!ATTRIBUTE_TYPES.includes(dto.type)) throw AppError.badRequest('Invalid attribute type');
      update.type = dto.type;
    }
    if (dto.unit !== undefined) update.unit = dto.unit;
    if (dto.options !== undefined) update.options = dto.options;
    if (dto.required !== undefined) update.required = dto.required;
    if (dto.categoryIds !== undefined) {
      update.categoryIds = dto.categoryIds.map((cid) => new Types.ObjectId(cid));
    }
    if (dto.sortOrder !== undefined) update.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    if (dto.filterable !== undefined) update.filterable = dto.filterable;
    if (dto.showOnCard !== undefined) update.showOnCard = dto.showOnCard;

    if (dto.key !== undefined) {
      const key = toCamelKey(dto.key);
      const clash = await attributeRepository.findByKey(key, id);
      if (clash) throw AppError.conflict('Attribute key already exists');
      update.key = key;
    }

    if (dto.slug !== undefined || dto.name !== undefined) {
      const base = dto.slug ? slugify(dto.slug) : slugify(dto.name ?? existing.name);
      update.slug = await ensureUniqueSlug(base, (s) => attributeRepository.slugExists(s, id));
    }

    const attribute = await attributeRepository.updateById(id, update);
    await activityLogService.log({
      actor: actorId,
      action: 'attributes.update',
      module: 'attributes',
      resourceType: 'attribute',
      resourceId: id,
    });
    return attribute;
  }

  async remove(id: string, actorId: string) {
    const deleted = await attributeRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('Attribute not found');
    await activityLogService.log({
      actor: actorId,
      action: 'attributes.delete',
      module: 'attributes',
      resourceType: 'attribute',
      resourceId: id,
      severity: 'warn',
    });
  }

  private async assertCategories(categoryIds?: string[]) {
    if (!categoryIds?.length) return;
    for (const id of categoryIds) {
      const category = await categoryRepository.findById(id);
      if (!category) throw AppError.badRequest(`Category not found: ${id}`);
    }
  }
}

export const attributeService = new AttributeService();
