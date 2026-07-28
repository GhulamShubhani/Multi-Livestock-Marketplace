import { activityLogRepository } from '../repository/activity-log.repository';
import type { ActivitySeverity } from '../interface/activity-log.interface';
import type { Types } from 'mongoose';
import { logger } from '../../../config/logger';

export interface LogActivityInput {
  actor?: Types.ObjectId | string;
  actorEmail?: string;
  action: string;
  module: string;
  resourceType?: string;
  resourceId?: Types.ObjectId | string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  severity?: ActivitySeverity;
}

export class ActivityLogService {
  async log(input: LogActivityInput): Promise<void> {
    try {
      await activityLogRepository.create({
        actor: input.actor as Types.ObjectId | undefined,
        actorEmail: input.actorEmail,
        action: input.action,
        module: input.module,
        resourceType: input.resourceType,
        resourceId: input.resourceId as Types.ObjectId | undefined,
        ip: input.ip,
        userAgent: input.userAgent,
        metadata: input.metadata,
        severity: input.severity ?? 'info',
      });
    } catch (error) {
      logger.error('Failed to write activity log', {
        error: error instanceof Error ? error.message : String(error),
        action: input.action,
      });
    }
  }

  async list(query: Record<string, unknown>) {
    return activityLogRepository.list(query);
  }
}

export const activityLogService = new ActivityLogService();
