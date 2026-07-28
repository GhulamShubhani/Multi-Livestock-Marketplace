import type { FilterQuery, Types } from 'mongoose';
import { UserModel } from '../model/user.model';
import type { IUser, UserDocument, UserStatus } from '../interface/user.interface';

type UserCreateInput = Pick<
  IUser,
  'email' | 'passwordHash' | 'firstName' | 'lastName' | 'role' | 'status' | 'isEmailVerified'
> &
  Partial<
    Pick<
      IUser,
      | 'phone'
      | 'emailVerificationTokenHash'
      | 'emailVerificationExpires'
      | 'permissionsOverride'
    >
  >;

export interface UserListFilter {
  q?: string;
  status?: UserStatus;
  roleId?: string;
  skip: number;
  limit: number;
}

export class UserRepository {
  async create(data: UserCreateInput): Promise<UserDocument> {
    return UserModel.create(data);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmailWithSecrets(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() })
      .select(
        '+passwordHash +emailVerificationTokenHash +emailVerificationExpires +passwordResetTokenHash +passwordResetExpires +otpHash +otpExpires',
      )
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec();
  }

  async findByIdWithSecrets(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id)
      .select(
        '+passwordHash +emailVerificationTokenHash +emailVerificationExpires +passwordResetTokenHash +passwordResetExpires +otpHash +otpExpires',
      )
      .exec();
  }

  async findByIdWithRole(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id)
      .populate({
        path: 'role',
        populate: { path: 'permissions' },
      })
      .exec();
  }

  async findByEmailVerificationToken(tokenHash: string): Promise<UserDocument | null> {
    return UserModel.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    })
      .select('+emailVerificationTokenHash +emailVerificationExpires')
      .exec();
  }

  async findByPasswordResetToken(tokenHash: string): Promise<UserDocument | null> {
    return UserModel.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    })
      .select('+passwordResetTokenHash +passwordResetExpires +passwordHash')
      .exec();
  }

  async list(filter: UserListFilter): Promise<{ items: UserDocument[]; total: number }> {
    const query: FilterQuery<IUser> = {};

    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.roleId) {
      query.role = filter.roleId;
    }
    if (filter.q) {
      const q = filter.q.trim();
      query.$or = [
        { email: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      UserModel.find(query)
        .populate({ path: 'role', populate: { path: 'permissions' } })
        .sort({ createdAt: -1 })
        .skip(filter.skip)
        .limit(filter.limit)
        .exec(),
      UserModel.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  async updateById(
    id: string | Types.ObjectId,
    update: Partial<IUser>,
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate({ path: 'role', populate: { path: 'permissions' } })
      .exec();
  }

  async softDelete(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      { $set: { status: 'inactive' as UserStatus } },
      { new: true },
    )
      .populate({ path: 'role', populate: { path: 'permissions' } })
      .exec();
  }
}

export const userRepository = new UserRepository();
