import type { Types } from 'mongoose';
import { RefreshTokenModel } from '../model/refresh-token.model';
import type { IRefreshToken, RefreshTokenDocument } from '../interface/refresh-token.interface';

export class RefreshTokenRepository {
  async create(
    data: Pick<IRefreshToken, 'user' | 'tokenHash' | 'familyId' | 'expiresAt'> &
      Partial<Pick<IRefreshToken, 'userAgent' | 'ip'>>,
  ): Promise<RefreshTokenDocument> {
    return RefreshTokenModel.create(data);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenDocument | null> {
    return RefreshTokenModel.findOne({ tokenHash }).exec();
  }

  async revoke(token: RefreshTokenDocument, replacedBy?: Types.ObjectId): Promise<RefreshTokenDocument> {
    token.revokedAt = new Date();
    if (replacedBy) {
      token.replacedBy = replacedBy;
    }
    return token.save();
  }

  async revokeFamily(familyId: string): Promise<void> {
    await RefreshTokenModel.updateMany(
      { familyId, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } },
    ).exec();
  }

  async revokeAllForUser(userId: string | Types.ObjectId): Promise<void> {
    await RefreshTokenModel.updateMany(
      { user: userId, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } },
    ).exec();
  }

  async listActiveForUser(userId: string): Promise<RefreshTokenDocument[]> {
    return RefreshTokenModel.find({
      user: userId,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  async revokeById(sessionId: string, userId?: string): Promise<boolean> {
    const filter: Record<string, unknown> = {
      _id: sessionId,
      revokedAt: { $exists: false },
    };
    if (userId) {
      filter.user = userId;
    }

    const result = await RefreshTokenModel.updateOne(filter, {
      $set: { revokedAt: new Date() },
    }).exec();

    return result.modifiedCount > 0;
  }

  async findActiveByIdForUser(sessionId: string, userId: string): Promise<RefreshTokenDocument | null> {
    return RefreshTokenModel.findOne({
      _id: sessionId,
      user: userId,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).exec();
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
