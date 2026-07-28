import { Schema, model } from 'mongoose';
import type { IRole } from '../interface/role.interface';

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    displayName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'roles' },
);

export const RoleModel = model<IRole>('Role', roleSchema);
