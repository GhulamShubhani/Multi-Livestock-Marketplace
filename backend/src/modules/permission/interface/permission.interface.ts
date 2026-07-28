import type { Document, Types } from 'mongoose';

export interface IPermission {
  key: string;
  module: string;
  action: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PermissionDocument = Document<Types.ObjectId> & IPermission;
