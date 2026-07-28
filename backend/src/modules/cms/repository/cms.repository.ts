import type { FilterQuery } from 'mongoose';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { CmsPageModel } from '../model/cms.model';
import type { CmsPageDocument, ICmsPage } from '../interface/cms.interface';

export class CmsRepository {
  async create(data: Partial<ICmsPage>): Promise<CmsPageDocument> {
    return CmsPageModel.create(data);
  }

  async findById(id: string): Promise<CmsPageDocument | null> {
    return CmsPageModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<CmsPageDocument | null> {
    return CmsPageModel.findOne({ slug }).exec();
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<ICmsPage> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    return Boolean(await CmsPageModel.exists(filter));
  }

  async list(query: Record<string, unknown>, publishedOnly = false) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<ICmsPage> = {};
    if (publishedOnly) filter.status = 'published';
    else if (typeof query.status === 'string') filter.status = query.status as ICmsPage['status'];
    if (typeof query.q === 'string' && query.q) {
      filter.$or = [
        { title: { $regex: query.q, $options: 'i' } },
        { slug: { $regex: query.q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      CmsPageModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).exec(),
      CmsPageModel.countDocuments(filter).exec(),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async updateById(id: string, data: Partial<ICmsPage>): Promise<CmsPageDocument | null> {
    return CmsPageModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    return Boolean(await CmsPageModel.findByIdAndDelete(id).exec());
  }
}

export const cmsRepository = new CmsRepository();
