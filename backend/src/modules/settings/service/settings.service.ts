import { AppError } from '../../../utils/AppError';
import { activityLogService } from '../../activity-log/service/activity-log.service';
import { PUBLIC_SETTINGS_KEYS } from '../interface/settings.interface';
import { settingsRepository } from '../repository/settings.repository';

export class SettingsService {
  async getPublic(key: string) {
    if (!(PUBLIC_SETTINGS_KEYS as readonly string[]).includes(key)) {
      throw AppError.forbidden('Settings key is not public');
    }
    const settings = await settingsRepository.findByKey(key);
    return settings ?? { key, value: {} };
  }

  async getAdmin(key: string) {
    const settings = await settingsRepository.findByKey(key);
    return settings ?? { key, value: {} };
  }

  async listAdmin() {
    return settingsRepository.list();
  }

  async upsert(key: string, value: Record<string, unknown>, actorId: string) {
    if (!key?.trim()) throw AppError.badRequest('Settings key is required');
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw AppError.badRequest('Settings value must be an object');
    }

    const settings = await settingsRepository.upsert(key.trim().toLowerCase(), value, actorId);
    await activityLogService.log({
      actor: actorId,
      action: 'settings.upsert',
      module: 'settings',
      metadata: { key },
    });
    return settings;
  }
}

export const settingsService = new SettingsService();
