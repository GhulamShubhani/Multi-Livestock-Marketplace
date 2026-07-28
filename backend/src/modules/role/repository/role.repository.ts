import { Types } from 'mongoose';
import { RoleModel } from '../model/role.model';
import type { IRole, RoleDocument } from '../interface/role.interface';

export class RoleRepository {
  async upsertByName(
    data: Pick<IRole, 'name' | 'displayName' | 'description' | 'isSystem'> & {
      permissions: Types.ObjectId[];
    },
  ): Promise<RoleDocument> {
    const role = await RoleModel.findOneAndUpdate(
      { name: data.name },
      { $set: data },
      { upsert: true, new: true },
    ).exec();

    if (!role) {
      throw new Error(`Failed to upsert role ${data.name}`);
    }
    return role;
  }

  async findByName(name: string): Promise<RoleDocument | null> {
    return RoleModel.findOne({ name }).exec();
  }

  async findByNameWithPermissions(name: string): Promise<RoleDocument | null> {
    return RoleModel.findOne({ name }).populate('permissions').exec();
  }

  async findById(id: string): Promise<RoleDocument | null> {
    return RoleModel.findById(id).exec();
  }

  async findByIdWithPermissions(id: string): Promise<RoleDocument | null> {
    return RoleModel.findById(id).populate('permissions').exec();
  }
}

export const roleRepository = new RoleRepository();
