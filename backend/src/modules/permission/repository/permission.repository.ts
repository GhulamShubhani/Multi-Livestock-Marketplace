import { PermissionModel } from '../model/permission.model';
import type { IPermission, PermissionDocument } from '../interface/permission.interface';

export class PermissionRepository {
  async upsertMany(
    items: Array<Pick<IPermission, 'key' | 'module' | 'action' | 'description'>>,
  ): Promise<void> {
    await Promise.all(
      items.map((item) =>
        PermissionModel.updateOne(
          { key: item.key },
          { $set: item },
          { upsert: true },
        ),
      ),
    );
  }

  async findAll(): Promise<PermissionDocument[]> {
    return PermissionModel.find().sort({ module: 1, action: 1 }).exec();
  }

  async findByKeys(keys: string[]): Promise<PermissionDocument[]> {
    return PermissionModel.find({ key: { $in: keys } }).exec();
  }

  async findIdsByKeys(keys: string[]): Promise<string[]> {
    const docs = await PermissionModel.find({ key: { $in: keys } }).select('_id').lean().exec();
    return docs.map((d) => String(d._id));
  }
}

export const permissionRepository = new PermissionRepository();
