import type { Document, Types } from 'mongoose';

export interface IRole {
  name: string;
  displayName: string;
  description?: string;
  permissions: Types.ObjectId[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type RoleDocument = Document<Types.ObjectId> & IRole;
