import { Schema, model } from 'mongoose';
import type { IActivityLog } from '../interface/activity-log.interface';

const activityLogSchema = new Schema<IActivityLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    actorEmail: { type: String, trim: true, lowercase: true },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    resourceType: { type: String },
    resourceId: { type: Schema.Types.ObjectId },
    ip: { type: String },
    userAgent: { type: String },
    metadata: { type: Schema.Types.Mixed },
    severity: { type: String, enum: ['info', 'warn', 'critical'], default: 'info' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'activity_logs',
  },
);

activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

export const ActivityLogModel = model<IActivityLog>('ActivityLog', activityLogSchema);
