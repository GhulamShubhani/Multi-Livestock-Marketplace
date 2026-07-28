import type { Document, Types } from 'mongoose';

export interface IRefreshToken {
  user: Types.ObjectId;
  tokenHash: string;
  familyId: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type RefreshTokenDocument = Document<Types.ObjectId> & IRefreshToken;
