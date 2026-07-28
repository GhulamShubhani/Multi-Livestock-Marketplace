import type { Document, Types } from 'mongoose';

export type ActivitySeverity = 'info' | 'warn' | 'critical';

export interface IActivityLog {
  actor?: Types.ObjectId;
  actorEmail?: string;
  action: string;
  module: string;
  resourceType?: string;
  resourceId?: Types.ObjectId;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  severity: ActivitySeverity;
  createdAt: Date;
}

export type ActivityLogDocument = Document<Types.ObjectId> & IActivityLog;
