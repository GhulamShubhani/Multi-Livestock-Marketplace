import { Types } from 'mongoose';
import { AppError } from '../../../utils/AppError';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { notificationRepository } from '../repository/notification.repository';

export class NotificationService {
  async listMine(userId: string, query: Record<string, unknown>) {
    return notificationRepository.listForUser(userId, query);
  }

  async markRead(userId: string, id: string) {
    const notification = await notificationRepository.markRead(id, userId);
    if (!notification) throw AppError.notFound('Notification not found');
    return notification;
  }

  async markAllRead(userId: string) {
    const count = await notificationRepository.markAllRead(userId);
    return { modified: count };
  }

  async createForUser(
    actorId: string,
    dto: {
      userId: string;
      title: string;
      body: string;
      type?: string;
      data?: Record<string, unknown>;
      channel?: 'in_app' | 'email';
    },
  ) {
    const notification = await notificationRepository.create({
      user: new Types.ObjectId(dto.userId),
      title: dto.title,
      body: dto.body,
      type: dto.type ?? 'general',
      data: dto.data,
      channel: dto.channel ?? 'in_app',
      isRead: false,
    });

    await activityLogService.log({
      actor: actorId,
      action: 'notifications.create',
      module: 'notifications',
      resourceId: notification._id,
    });

    return notification;
  }

  async broadcast(
    actorId: string,
    dto: {
      title: string;
      body: string;
      type?: string;
      data?: Record<string, unknown>;
      roleNames?: string[];
      userIds?: string[];
    },
  ) {
    let targets = dto.userIds ?? [];
    if (dto.roleNames?.length) {
      const byRole = await notificationRepository.findUserIdsByRoleNames(dto.roleNames);
      targets = Array.from(new Set([...targets, ...byRole]));
    }
    if (!targets.length) {
      throw AppError.badRequest('No recipients specified');
    }

    await notificationRepository.createMany(
      targets.map((userId) => ({
        user: new Types.ObjectId(userId),
        title: dto.title,
        body: dto.body,
        type: dto.type ?? 'broadcast',
        data: dto.data,
        channel: 'in_app' as const,
        isRead: false,
      })),
    );

    await activityLogService.log({
      actor: actorId,
      action: 'notifications.broadcast',
      module: 'notifications',
      metadata: { recipients: targets.length },
    });

    return { recipients: targets.length };
  }
}

export const notificationService = new NotificationService();
