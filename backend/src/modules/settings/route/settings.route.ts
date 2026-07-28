import { Router } from 'express';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  settingsController,
  settingsKeyParam,
  upsertSettingsValidators,
} from '../controller/settings.controller';

const router = Router();

router.get('/public/:key', validateRequest(settingsKeyParam), settingsController.getPublic);

router.get('/', authenticate, authorize(PERMISSIONS.SETTINGS_READ), settingsController.listAdmin);
router.get(
  '/:key',
  authenticate,
  authorize(PERMISSIONS.SETTINGS_READ),
  validateRequest(settingsKeyParam),
  settingsController.getAdmin,
);
router.put(
  '/:key',
  authenticate,
  authorize(PERMISSIONS.SETTINGS_UPDATE),
  csrfProtection,
  validateRequest(upsertSettingsValidators),
  settingsController.upsert,
);

export default router;
