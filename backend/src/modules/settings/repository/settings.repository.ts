import { Types } from 'mongoose';
import { SettingsModel } from '../model/settings.model';
import type { SettingsDocument } from '../interface/settings.interface';

export class SettingsRepository {
  async findByKey(key: string): Promise<SettingsDocument | null> {
    return SettingsModel.findOne({ key: key.toLowerCase() }).exec();
  }

  async list(): Promise<SettingsDocument[]> {
    return SettingsModel.find().sort({ key: 1 }).exec();
  }

  async upsert(
    key: string,
    value: Record<string, unknown>,
    updatedBy?: string,
  ): Promise<SettingsDocument> {
    const doc = await SettingsModel.findOneAndUpdate(
      { key: key.toLowerCase() },
      {
        $set: {
          value,
          ...(updatedBy ? { updatedBy: new Types.ObjectId(updatedBy) } : {}),
        },
      },
      { upsert: true, new: true },
    ).exec();
    return doc as SettingsDocument;
  }
}

export const settingsRepository = new SettingsRepository();
