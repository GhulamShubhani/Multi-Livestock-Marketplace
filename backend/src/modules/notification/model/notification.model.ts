import { Schema, model } from 'mongoose';
import type { INotification } from '../interface/notification.interface';

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true, index: true },
    data: { type: Schema.Types.Mixed },
    channel: { type: String, enum: ['in_app', 'email'], default: 'in_app' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'notifications' },
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = model<INotification>('Notification', notificationSchema);
