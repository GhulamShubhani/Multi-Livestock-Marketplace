import { Types } from 'mongoose';
import { AppError } from '../../../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { sellerRepository } from '../repository/seller.repository';
import type {
  ISellerAddress,
  ISellerProfile,
  SellerType,
  SellerVerificationStatus,
} from '../interface/seller.interface';

export interface SellerInput {
  userId?: string;
  businessName: string;
  sellerType?: SellerType;
  yearsOfExperience?: number;
  verificationStatus?: SellerVerificationStatus;
  whatsapp?: string;
  phone?: string;
  address?: ISellerAddress;
  bio?: string;
  isActive?: boolean;
}

export class SellerService {
  async listPublic(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const { items, total } = await sellerRepository.list({
      skip,
      limit,
      q: typeof query.q === 'string' ? query.q : undefined,
      activeOnly: true,
      verificationStatus: 'verified',
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async listAdmin(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const { items, total } = await sellerRepository.list({
      skip,
      limit,
      q: typeof query.q === 'string' ? query.q : undefined,
      verificationStatus:
        typeof query.verificationStatus === 'string' ? query.verificationStatus : undefined,
      activeOnly: query.active === 'true' ? true : query.active === 'false' ? false : undefined,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async getById(id: string) {
    const seller = await sellerRepository.findById(id);
    if (!seller) throw AppError.notFound('Seller not found');
    return seller;
  }

  async getMine(userId: string) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller) throw AppError.notFound('Seller profile not found');
    return seller;
  }

  async upsertMine(userId: string, dto: SellerInput) {
    const existing = await sellerRepository.findByUserId(userId);
    if (existing) {
      return this.update(String(existing._id), dto, userId);
    }
    return this.create({ ...dto, userId }, userId);
  }

  async create(dto: SellerInput, actorId: string) {
    const userId = dto.userId ?? actorId;
    const existing = await sellerRepository.findByUserId(userId);
    if (existing) throw AppError.conflict('Seller profile already exists for this user');

    const seller = await sellerRepository.create({
      userId: new Types.ObjectId(userId),
      businessName: dto.businessName.trim(),
      sellerType: dto.sellerType ?? 'individual',
      yearsOfExperience: dto.yearsOfExperience,
      verificationStatus: dto.verificationStatus ?? 'unverified',
      whatsapp: dto.whatsapp,
      phone: dto.phone,
      address: dto.address,
      bio: dto.bio,
      isActive: dto.isActive ?? true,
    });

    await activityLogService.log({
      actor: actorId,
      action: 'sellers.create',
      module: 'sellers',
      resourceId: seller._id,
    });

    return sellerRepository.findById(String(seller._id));
  }

  async update(id: string, dto: Partial<SellerInput>, actorId: string) {
    const update: Partial<ISellerProfile> = {};
    if (dto.businessName !== undefined) update.businessName = dto.businessName.trim();
    if (dto.sellerType !== undefined) update.sellerType = dto.sellerType;
    if (dto.yearsOfExperience !== undefined) update.yearsOfExperience = dto.yearsOfExperience;
    if (dto.verificationStatus !== undefined) update.verificationStatus = dto.verificationStatus;
    if (dto.whatsapp !== undefined) update.whatsapp = dto.whatsapp;
    if (dto.phone !== undefined) update.phone = dto.phone;
    if (dto.address !== undefined) update.address = dto.address;
    if (dto.bio !== undefined) update.bio = dto.bio;
    if (dto.isActive !== undefined) update.isActive = dto.isActive;

    const seller = await sellerRepository.updateById(id, update);
    if (!seller) throw AppError.notFound('Seller not found');

    await activityLogService.log({
      actor: actorId,
      action: 'sellers.update',
      module: 'sellers',
      resourceId: id,
    });
    return seller;
  }

  async remove(id: string, actorId: string) {
    const deleted = await sellerRepository.deleteById(id);
    if (!deleted) throw AppError.notFound('Seller not found');
    await activityLogService.log({
      actor: actorId,
      action: 'sellers.delete',
      module: 'sellers',
      resourceId: id,
      severity: 'warn',
    });
  }
}

export const sellerService = new SellerService();
