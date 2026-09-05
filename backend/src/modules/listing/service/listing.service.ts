import { randomBytes } from 'crypto';
import { Types } from 'mongoose';
import { env } from '../../../config/env';
import { AppError } from '../../../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { ensureUniqueSlug, slugify } from '../../../utils/slug';
import type { ListingImage, ListingVideo, SeoFields } from '../../../types/media';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { breedRepository } from '../../breed/repository/breed.repository';
import { categoryRepository } from '../../category/repository/category.repository';
import { listingRepository } from '../repository/listing.repository';
import type {
  AvailabilityStatus,
  IListing,
  IListingLocation,
  ListingGender,
  VerificationStatus,
} from '../interface/listing.interface';

export interface ListingInput {
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  breed?: string;
  price: number;
  negotiable?: boolean;
  currency?: string;
  seller?: string;
  sellerMobile?: string;
  sellerWhatsApp?: string;
  location: IListingLocation;
  images?: ListingImage[];
  videos?: ListingVideo[];
  ageMonths?: number;
  gender?: ListingGender;
  weight?: number;
  healthStatus?: string;
  vaccinationStatus?: string;
  availabilityStatus?: AvailabilityStatus;
  verificationStatus?: VerificationStatus;
  featured?: boolean;
  premium?: boolean;
  isActive?: boolean;
  attributes?: Record<string, unknown>;
  seo?: SeoFields;
}

async function generateListingId(): Promise<string> {
  for (let i = 0; i < 8; i += 1) {
    const candidate = `LST-${randomBytes(3).toString('hex').toUpperCase()}`;
    if (!(await listingRepository.listingIdExists(candidate))) return candidate;
  }
  return `LST-${Date.now().toString(36).toUpperCase()}`;
}

export class ListingService {
  async resolveCategoryId(categoryOrSlug?: string): Promise<string | undefined> {
    if (!categoryOrSlug) return undefined;
    if (/^[a-f\d]{24}$/i.test(categoryOrSlug)) return categoryOrSlug;
    const cat = await categoryRepository.findBySlug(categoryOrSlug.toLowerCase());
    return cat ? String(cat._id) : undefined;
  }

  async listPublic(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const categoryParam =
      typeof query.category === 'string'
        ? query.category
        : typeof query.categorySlug === 'string'
          ? query.categorySlug
          : undefined;
    const category = await this.resolveCategoryId(categoryParam);

    // Unknown slug → empty result (not all listings)
    if (categoryParam && !category) {
      return { items: [], meta: buildPaginationMeta(page, limit, 0) };
    }

    const { items, total } = await listingRepository.list({
      q: typeof query.q === 'string' ? query.q : undefined,
      availabilityStatus: 'available',
      isActive: true,
      breed: typeof query.breed === 'string' ? query.breed : undefined,
      category,
      seller: typeof query.seller === 'string' ? query.seller : undefined,
      gender: typeof query.gender === 'string' ? query.gender : undefined,
      featured: query.featured === 'true' ? true : query.featured === 'false' ? false : undefined,
      state: typeof query.state === 'string' ? query.state : undefined,
      city: typeof query.city === 'string' ? query.city : undefined,
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
    const availabilityStatus =
      typeof query.availabilityStatus === 'string'
        ? (query.availabilityStatus as AvailabilityStatus)
        : typeof query.status === 'string'
          ? (query.status as AvailabilityStatus)
          : undefined;

    const { items, total } = await listingRepository.list({
      q: typeof query.q === 'string' ? query.q : undefined,
      availabilityStatus,
      verificationStatus:
        typeof query.verificationStatus === 'string'
          ? (query.verificationStatus as VerificationStatus)
          : undefined,
      breed: typeof query.breed === 'string' ? query.breed : undefined,
      category: typeof query.category === 'string' ? query.category : undefined,
      seller: typeof query.seller === 'string' ? query.seller : undefined,
      gender: typeof query.gender === 'string' ? query.gender : undefined,
      featured: query.featured === 'true' ? true : query.featured === 'false' ? false : undefined,
      state: typeof query.state === 'string' ? query.state : undefined,
      city: typeof query.city === 'string' ? query.city : undefined,
      minPrice: query.minPrice !== undefined ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice !== undefined ? Number(query.maxPrice) : undefined,
      skip,
      limit,
      sort: typeof query.sort === 'string' ? query.sort : undefined,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async getBySlug(slug: string, publicOnly = true) {
    const listing = await listingRepository.findBySlug(slug);
    if (
      !listing ||
      (publicOnly && (listing.availabilityStatus !== 'available' || !listing.isActive))
    ) {
      throw AppError.notFound('Listing not found');
    }
    return listing;
  }

  async getById(id: string) {
    const listing = await listingRepository.findById(id);
    if (!listing) throw AppError.notFound('Listing not found');
    return listing;
  }

  async create(dto: ListingInput, actorId: string) {
    await this.assertRefs(dto.category, dto.breed, dto.subcategory);

    const sellerId = dto.seller ?? actorId;
    const baseSlug = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    const slug = await ensureUniqueSlug(baseSlug, (s) => listingRepository.slugExists(s));
    const listingId = await generateListingId();

    const listing = await listingRepository.create({
      title: dto.title.trim(),
      slug,
      listingId,
      description: dto.description,
      shortDescription: dto.shortDescription,
      category: new Types.ObjectId(dto.category),
      subcategory: dto.subcategory ? new Types.ObjectId(dto.subcategory) : undefined,
      breed: dto.breed ? new Types.ObjectId(dto.breed) : undefined,
      price: dto.price,
      negotiable: dto.negotiable ?? false,
      currency: (dto.currency ?? env.DEFAULT_CURRENCY).toUpperCase(),
      seller: new Types.ObjectId(sellerId),
      sellerMobile: dto.sellerMobile,
      sellerWhatsApp: dto.sellerWhatsApp,
      location: dto.location,
      images: this.normalizeImages(dto.images),
      videos: this.normalizeVideos(dto.videos),
      ageMonths: dto.ageMonths,
      gender: dto.gender ?? 'unknown',
      weight: dto.weight,
      healthStatus: dto.healthStatus,
      vaccinationStatus: dto.vaccinationStatus,
      availabilityStatus: dto.availabilityStatus ?? 'draft',
      verificationStatus: dto.verificationStatus ?? 'unverified',
      featured: dto.featured ?? false,
      premium: dto.premium ?? false,
      isActive: dto.isActive ?? true,
      attributes: dto.attributes ?? {},
      seo: dto.seo,
      createdBy: new Types.ObjectId(actorId),
    });

    await listingRepository.incrementCategoryCount(dto.category, 1);

    await activityLogService.log({
      actor: actorId,
      action: 'listings.create',
      module: 'listings',
      resourceType: 'listing',
      resourceId: listing._id,
    });

    return listingRepository.findById(String(listing._id));
  }

  async update(id: string, dto: Partial<ListingInput>, actorId: string) {
    const existing = await listingRepository.findById(id);
    if (!existing) throw AppError.notFound('Listing not found');

    if (dto.category || dto.breed || dto.subcategory) {
      await this.assertRefs(
        dto.category ?? String(existing.category),
        dto.breed ?? (existing.breed ? String(existing.breed) : undefined),
        dto.subcategory ?? (existing.subcategory ? String(existing.subcategory) : undefined),
      );
    }

    const update: Partial<IListing> = { updatedBy: new Types.ObjectId(actorId) };

    if (dto.title !== undefined) update.title = dto.title.trim();
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.shortDescription !== undefined) update.shortDescription = dto.shortDescription;
    if (dto.category !== undefined) update.category = new Types.ObjectId(dto.category);
    if (dto.subcategory !== undefined) {
      update.subcategory = dto.subcategory ? new Types.ObjectId(dto.subcategory) : undefined;
    }
    if (dto.breed !== undefined) {
      update.breed = dto.breed ? new Types.ObjectId(dto.breed) : undefined;
    }
    if (dto.price !== undefined) update.price = dto.price;
    if (dto.negotiable !== undefined) update.negotiable = dto.negotiable;
    if (dto.currency !== undefined) update.currency = dto.currency.toUpperCase();
    if (dto.seller !== undefined) update.seller = new Types.ObjectId(dto.seller);
    if (dto.sellerMobile !== undefined) update.sellerMobile = dto.sellerMobile;
    if (dto.sellerWhatsApp !== undefined) update.sellerWhatsApp = dto.sellerWhatsApp;
    if (dto.location !== undefined) update.location = dto.location;
    if (dto.images !== undefined) update.images = this.normalizeImages(dto.images);
    if (dto.videos !== undefined) update.videos = this.normalizeVideos(dto.videos);
    if (dto.ageMonths !== undefined) update.ageMonths = dto.ageMonths;
    if (dto.gender !== undefined) update.gender = dto.gender;
    if (dto.weight !== undefined) update.weight = dto.weight;
    if (dto.healthStatus !== undefined) update.healthStatus = dto.healthStatus;
    if (dto.vaccinationStatus !== undefined) update.vaccinationStatus = dto.vaccinationStatus;
    if (dto.availabilityStatus !== undefined) update.availabilityStatus = dto.availabilityStatus;
    if (dto.verificationStatus !== undefined) update.verificationStatus = dto.verificationStatus;
    if (dto.featured !== undefined) update.featured = dto.featured;
    if (dto.premium !== undefined) update.premium = dto.premium;
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    if (dto.attributes !== undefined) update.attributes = dto.attributes;
    if (dto.seo !== undefined) update.seo = dto.seo;

    if (dto.slug !== undefined || dto.title !== undefined) {
      const base = dto.slug ? slugify(dto.slug) : slugify(dto.title ?? existing.title);
      update.slug = await ensureUniqueSlug(base, (s) => listingRepository.slugExists(s, id));
    }

    const previousCategory = String(existing.category);
    const listing = await listingRepository.updateById(id, update);

    if (dto.category && dto.category !== previousCategory) {
      await listingRepository.incrementCategoryCount(previousCategory, -1);
      await listingRepository.incrementCategoryCount(dto.category, 1);
    }

    await activityLogService.log({
      actor: actorId,
      action: 'listings.update',
      module: 'listings',
      resourceType: 'listing',
      resourceId: id,
    });
    return listing;
  }

  async updateStatus(id: string, availabilityStatus: AvailabilityStatus, actorId: string) {
    const listing = await listingRepository.updateById(id, {
      availabilityStatus,
      updatedBy: new Types.ObjectId(actorId),
    });
    if (!listing) throw AppError.notFound('Listing not found');
    await activityLogService.log({
      actor: actorId,
      action: 'listings.status_update',
      module: 'listings',
      resourceType: 'listing',
      resourceId: id,
      metadata: { availabilityStatus },
    });
    return listing;
  }

  async verify(id: string, verificationStatus: VerificationStatus, actorId: string) {
    const listing = await listingRepository.updateById(id, {
      verificationStatus,
      updatedBy: new Types.ObjectId(actorId),
    });
    if (!listing) throw AppError.notFound('Listing not found');
    await activityLogService.log({
      actor: actorId,
      action: 'listings.verify',
      module: 'listings',
      resourceType: 'listing',
      resourceId: id,
      metadata: { verificationStatus },
    });
    return listing;
  }

  async remove(id: string, actorId: string) {
    const existing = await listingRepository.findById(id);
    if (!existing) throw AppError.notFound('Listing not found');

    await listingRepository.deleteById(id);
    await listingRepository.incrementCategoryCount(String(existing.category), -1);

    await activityLogService.log({
      actor: actorId,
      action: 'listings.delete',
      module: 'listings',
      resourceType: 'listing',
      resourceId: id,
      severity: 'warn',
    });
  }

  private async assertRefs(categoryId: string, breedId?: string, subcategoryId?: string) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) throw AppError.badRequest('Category not found');

    if (subcategoryId) {
      const subcategory = await categoryRepository.findById(subcategoryId);
      if (!subcategory) throw AppError.badRequest('Subcategory not found');
    }

    if (breedId) {
      const breed = await breedRepository.findById(breedId);
      if (!breed) throw AppError.badRequest('Breed not found');
    }
  }

  private normalizeImages(images?: ListingImage[]): ListingImage[] {
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

  private normalizeVideos(videos?: ListingVideo[]): ListingVideo[] {
    if (!videos?.length) return [];
    return videos.map((v) => ({
      url: v.url,
      publicId: v.publicId,
      alt: v.alt,
    }));
  }
}

export const listingService = new ListingService();
