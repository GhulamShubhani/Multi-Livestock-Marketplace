import type { FilterQuery } from 'mongoose';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { ActivityLogModel } from '../model/activity-log.model';
import type { IActivityLog } from '../interface/activity-log.interface';

export class ActivityLogRepository {
  async create(data: Omit<IActivityLog, 'createdAt'>): Promise<void> {
    await ActivityLogModel.create(data);
  }

  async list(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<IActivityLog> = {};

    if (typeof query.module === 'string') filter.module = query.module;
    if (typeof query.action === 'string') filter.action = query.action;
    if (typeof query.severity === 'string') filter.severity = query.severity as IActivityLog['severity'];
    if (typeof query.actor === 'string') filter.actor = query.actor;
    if (typeof query.q === 'string' && query.q) {
      filter.$or = [
        { action: { $regex: query.q, $options: 'i' } },
        { actorEmail: { $regex: query.q, $options: 'i' } },
        { module: { $regex: query.q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      ActivityLogModel.find(filter)
        .populate('actor', 'email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      ActivityLogModel.countDocuments(filter).exec(),
    ]);

    return { items, meta: buildPaginationMeta(page, limit, total) };
  }
}

export const activityLogRepository = new ActivityLogRepository();
