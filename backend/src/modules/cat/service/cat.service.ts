import { Types } from 'mongoose';
import { env } from '../../../config/env';
import { AppError } from '../../../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { ensureUniqueSlug, slugify } from '../../../utils/slug';
import type { CatImage, SeoFields } from '../../../types/media';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { breedRepository } from '../../breed/repository/breed.repository';
import { categoryRepository } from '../../category/repository/category.repository';
import { catRepository } from '../repository/cat.repository';
import type { CatGender, CatStatus, ICat } from '../interface/cat.interface';

export interface CatInput {
  name: string;
  slug?: string;
  sku?: string;
  description: string;
  shortDescription?: string;
  breed: string;
  category: string;
  ageMonths: number;
  gender?: CatGender;
  color?: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  stock?: number;
  status?: CatStatus;
  images?: CatImage[];
  attributes?: Record<string, string>;
  vaccinated?: boolean;
  neutered?: boolean;
  pedigree?: boolean;
  featured?: boolean;
  seo?: SeoFields;
}

export class CatService {
  async listPublic(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const { items, total } = await catRepository.list({
      q: typeof query.q === 'string' ? query.q : undefined,
      status: 'available',
      breed: typeof query.breed === 'string' ? query.breed : undefined,
      category: typeof query.category === 'string' ? query.category : undefined,
      gender: typeof query.gender === 'string' ? query.gender : undefined,
      featured: query.featured === 'true' ? true : query.featured === 'false' ? false : undefined,
      minPrice: query.minPrice !== undefined ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice !== undefined ? Number(query.maxPrice) : undefined,
      skip,
      limit,
      sort: typeof query.sort === 'string' ? query.sort : undefined,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async listAdmin(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const status =
      typeof query.status === 'string'
        ? (query.status as CatStatus)
        : undefined;

    const { items, total } = await catRepository.list({
      q: typeof query.q === 'string' ? query.q : undefined,
      status,
      breed: typeof query.breed === 'string' ? query.breed : undefined,
      category: typeof query.category === 'string' ? query.category : undefined,
      gender: typeof query.gender === 'string' ? query.gender : undefined,
      featured: query.featured === 'true' ? true : query.featured === 'false' ? false : undefined,
      minPrice: query.minPrice !== undefined ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice !== undefined ? Number(query.maxPrice) : undefined,
      skip,
      limit,
      sort: typeof query.sort === 'string' ? query.sort : undefined,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async getBySlug(slug: string, publicOnly = true) {
    const cat = await catRepository.findBySlug(slug);
    if (!cat || (publicOnly && cat.status !== 'available')) {
      throw AppError.notFound('Cat not found');
    }
    return cat;
  }

  async getById(id: string) {
    const cat = await catRepository.findById(id);
    if (!cat) throw AppError.notFound('Cat not found');
    return cat;
  }

  async create(dto: CatInput, actorId: string) {
    await this.assertRefs(dto.breed, dto.category);

    const baseSlug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const slug = await ensureUniqueSlug(baseSlug, (s) => catRepository.slugExists(s));

    const images = this.normalizeImages(dto.images);

    const cat = await catRepository.create({
      name: dto.name.trim(),
      slug,
      sku: dto.sku?.trim(),
      description: dto.description,
      shortDescription: dto.shortDescription,
      breed: new Types.ObjectId(dto.breed),
      category: new Types.ObjectId(dto.category),
      ageMonths: dto.ageMonths,
      gender: dto.gender ?? 'unknown',
      color: dto.color,
      price: dto.price,
      compareAtPrice: dto.compareAtPrice,
      currency: (dto.currency ?? env.DEFAULT_CURRENCY).toUpperCase(),
      stock: dto.stock ?? 1,
      status: dto.status ?? 'draft',
      images,
      attributes: dto.attributes,
      vaccinated: dto.vaccinated ?? false,
      neutered: dto.neutered ?? false,
      pedigree: dto.pedigree ?? false,
      featured: dto.featured ?? false,
      seo: dto.seo,
      createdBy: new Types.ObjectId(actorId),
    });

    await activityLogService.log({
      actor: actorId,
      action: 'cats.create',
      module: 'cats',
      resourceType: 'cat',
      resourceId: cat._id,
    });

    return catRepository.findById(String(cat._id));
  }

  async update(id: string, dto: Partial<CatInput>, actorId: string) {
    const existing = await catRepository.findById(id);
    if (!existing) throw AppError.notFound('Cat not found');

    if (dto.breed || dto.category) {
      await this.assertRefs(dto.breed ?? String(existing.breed), dto.category ?? String(existing.category));
    }

    const update: Partial<ICat> = { updatedBy: new Types.ObjectId(actorId) };

    if (dto.name !== undefined) update.name = dto.name.trim();
    if (dto.sku !== undefined) update.sku = dto.sku.trim();
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.shortDescription !== undefined) update.shortDescription = dto.shortDescription;
    if (dto.breed !== undefined) update.breed = new Types.ObjectId(dto.breed);
    if (dto.category !== undefined) update.category = new Types.ObjectId(dto.category);
    if (dto.ageMonths !== undefined) update.ageMonths = dto.ageMonths;
    if (dto.gender !== undefined) update.gender = dto.gender;
    if (dto.color !== undefined) update.color = dto.color;
    if (dto.price !== undefined) update.price = dto.price;
    if (dto.compareAtPrice !== undefined) update.compareAtPrice = dto.compareAtPrice;
    if (dto.currency !== undefined) update.currency = dto.currency.toUpperCase();
    if (dto.stock !== undefined) update.stock = dto.stock;
    if (dto.status !== undefined) update.status = dto.status;
    if (dto.images !== undefined) update.images = this.normalizeImages(dto.images);
    if (dto.attributes !== undefined) update.attributes = dto.attributes;
    if (dto.vaccinated !== undefined) update.vaccinated = dto.vaccinated;
    if (dto.neutered !== undefined) update.neutered = dto.neutered;
    if (dto.pedigree !== undefined) update.pedigree = dto.pedigree;
    if (dto.featured !== undefined) update.featured = dto.featured;
    if (dto.seo !== undefined) update.seo = dto.seo;

    if (dto.slug !== undefined || dto.name !== undefined) {
      const base = dto.slug ? slugify(dto.slug) : slugify(dto.name ?? existing.name);
      update.slug = await ensureUniqueSlug(base, (s) => catRepository.slugExists(s, id));
    }

    const cat = await catRepository.updateById(id, update);
    await activityLogService.log({
      actor: actorId,
      action: 'cats.update',
      module: 'cats',
      resourceType: 'cat',
      resourceId: id,
    });
    return cat;
  }

  async updateStatus(id: string, status: CatStatus, actorId: string) {
    const cat = await catRepository.updateById(id, {
      status,
      updatedBy: new Types.ObjectId(actorId),
    });
    if (!cat) throw AppError.notFound('Cat not found');
    await activityLogService.log({
      actor: actorId,
      action: 'cats.status_update',
      module: 'cats',
      resourceType: 'cat',
      resourceId: id,
      metadata: { status },
    });
    return cat;
  }

  async remove(id: string, actorId: string) {
    const deleted = await catRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('Cat not found');
    await activityLogService.log({
      actor: actorId,
      action: 'cats.delete',
      module: 'cats',
      resourceType: 'cat',
      resourceId: id,
      severity: 'warn',
    });
  }

  private async assertRefs(breedId: string, categoryId: string) {
    const [breed, category] = await Promise.all([
      breedRepository.findById(breedId),
      categoryRepository.findById(categoryId),
    ]);
    if (!breed) throw AppError.badRequest('Breed not found');
    if (!category) throw AppError.badRequest('Category not found');
  }

  private normalizeImages(images?: CatImage[]): CatImage[] {
    if (!images?.length) return [];
    const normalized = images.map((img, index) => ({
      url: img.url,
      publicId: img.publicId,
      alt: img.alt,
      isPrimary: img.isPrimary ?? index === 0,
    }));
    if (!normalized.some((i) => i.isPrimary)) {
      normalized[0].isPrimary = true;
    }
    return normalized;
  }
}

export const catService = new CatService();
