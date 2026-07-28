import { Schema, model } from 'mongoose';
import type { ISettings } from '../interface/settings.interface';

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    value: { type: Schema.Types.Mixed, required: true, default: {} },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'settings' },
);

export const SettingsModel = model<ISettings>('Settings', settingsSchema);
