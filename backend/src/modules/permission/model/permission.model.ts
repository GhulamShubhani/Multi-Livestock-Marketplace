import { Schema, model } from 'mongoose';
import type { IPermission } from '../interface/permission.interface';

const permissionSchema = new Schema<IPermission>(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    module: { type: String, required: true, trim: true, lowercase: true, index: true },
    action: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
  },
  { timestamps: true, collection: 'permissions' },
);

export const PermissionModel = model<IPermission>('Permission', permissionSchema);
