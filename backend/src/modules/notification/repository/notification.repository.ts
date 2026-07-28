import type { FilterQuery } from 'mongoose';
import { Types } from 'mongoose';
import { buildPaginationMeta, parsePagination } from '../../../utils/pagination';
import { NotificationModel } from '../model/notification.model';
import type { INotification, NotificationDocument } from '../interface/notification.interface';

export class NotificationRepository {
  async create(data: Partial<INotification>): Promise<NotificationDocument> {
    return NotificationModel.create(data);
  }

  async createMany(items: Array<Partial<INotification>>): Promise<void> {
    if (!items.length) return;
    await NotificationModel.insertMany(items);
  }

  async listForUser(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const filter: FilterQuery<INotification> = { user: userId };
    if (query.unread === 'true') filter.isRead = false;

    const [items, total, unreadCount] = await Promise.all([
      NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      NotificationModel.countDocuments(filter).exec(),
      NotificationModel.countDocuments({ user: userId, isRead: false }).exec(),
    ]);

    return { items, meta: buildPaginationMeta(page, limit, total), unreadCount };
  }

  async markRead(id: string, userId: string): Promise<NotificationDocument | null> {
    return NotificationModel.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true },
    ).exec();
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await NotificationModel.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    ).exec();
    return result.modifiedCount;
  }

  async findUserIdsByRoleNames(roleNames: string[]): Promise<string[]> {
    const RoleModel = (await import('../../role/model/role.model')).RoleModel;
    const UserModel = (await import('../../user/model/user.model')).UserModel;
    const roles = await RoleModel.find({ name: { $in: roleNames } }).select('_id').lean().exec();
    const roleIds = roles.map((r) => r._id);
    const users = await UserModel.find({ role: { $in: roleIds }, status: 'active' }).select('_id').lean().exec();
    return users.map((u) => String(u._id));
  }

  toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }
}

export const notificationRepository = new NotificationRepository();
