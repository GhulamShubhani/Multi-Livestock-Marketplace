import type { Document, Types } from 'mongoose';

export interface ISettings {
  key: string;
  value: Record<string, unknown>;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type SettingsDocument = Document<Types.ObjectId> & ISettings;

export const PUBLIC_SETTINGS_KEYS = ['general', 'seo', 'storefront'] as const;
