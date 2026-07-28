import type { Document, Types } from 'mongoose';

export interface INotification {
  user: Types.ObjectId;
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
  channel: 'in_app' | 'email';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export type NotificationDocument = Document<Types.ObjectId> & INotification;
