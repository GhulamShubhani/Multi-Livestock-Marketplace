import { Types } from 'mongoose';
import { AppError } from '../../../utils/AppError';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { listingRepository } from '../../listing/repository/listing.repository';
import { enquiryRepository } from '../repository/enquiry.repository';
import type { EnquiryContactMethod, EnquiryStatus, IEnquiry } from '../interface/enquiry.interface';

export interface EnquiryInput {
  listingId: string;
  message: string;
  contactMethod: EnquiryContactMethod;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
}

export class EnquiryService {
  async create(dto: EnquiryInput, buyerId?: string) {
    const listing = await listingRepository.findById(dto.listingId);
    if (!listing || !listing.isActive) {
      throw AppError.notFound('Listing not found');
    }

    const enquiry = await enquiryRepository.create({
      buyerId: buyerId ? new Types.ObjectId(buyerId) : undefined,
      sellerId: listing.seller as Types.ObjectId,
      listingId: listing._id as Types.ObjectId,
      message: dto.message.trim(),
      contactMethod: dto.contactMethod,
      buyerName: dto.buyerName,
      buyerPhone: dto.buyerPhone,
      buyerEmail: dto.buyerEmail,
      status: 'new',
    });

    if (buyerId) {
      await activityLogService.log({
        actor: buyerId,
        action: 'enquiries.create',
        module: 'enquiries',
        resourceId: enquiry._id,
      });
    }

    return enquiryRepository.findById(String(enquiry._id));
  }

  async listMine(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const { items, total } = await enquiryRepository.list({
      skip,
      limit,
      buyerId: userId,
      status: typeof query.status === 'string' ? query.status : undefined,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async listSeller(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const { items, total } = await enquiryRepository.list({
      skip,
      limit,
      sellerId: userId,
      status: typeof query.status === 'string' ? query.status : undefined,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async listAdmin(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const { items, total } = await enquiryRepository.list({
      skip,
      limit,
      listingId: typeof query.listingId === 'string' ? query.listingId : undefined,
      status: typeof query.status === 'string' ? query.status : undefined,
    });
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async updateStatus(id: string, status: EnquiryStatus, actorId: string) {
    const update: Partial<IEnquiry> = { status };
    const enquiry = await enquiryRepository.updateById(id, update);
    if (!enquiry) throw AppError.notFound('Enquiry not found');

    await activityLogService.log({
      actor: actorId,
      action: 'enquiries.status_update',
      module: 'enquiries',
      resourceId: id,
      metadata: { status },
    });
    return enquiry;
  }
}

export const enquiryService = new EnquiryService();
