import { ActivityLogModel } from '../model/activity-log.model';
import type { IActivityLog } from '../interface/activity-log.interface';

export class ActivityLogRepository {
  async create(data: Omit<IActivityLog, 'createdAt'>): Promise<void> {
    await ActivityLogModel.create(data);
  }
}

export const activityLogRepository = new ActivityLogRepository();
