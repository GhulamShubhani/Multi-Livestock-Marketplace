import { Router } from 'express';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  broadcastValidators,
  createNotificationValidators,
  listNotificationValidators,
  notificationController,
  notificationIdParam,
} from '../controller/notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest(listNotificationValidators), notificationController.listMine);
router.patch('/read-all', csrfProtection, notificationController.markAllRead);
router.patch(
  '/:id/read',
  csrfProtection,
  validateRequest(notificationIdParam),
  notificationController.markRead,
);

router.post(
  '/',
  authorize(PERMISSIONS.NOTIFICATIONS_CREATE),
  csrfProtection,
  validateRequest(createNotificationValidators),
  notificationController.create,
);
router.post(
  '/broadcast',
  authorize(PERMISSIONS.NOTIFICATIONS_CREATE),
  csrfProtection,
  validateRequest(broadcastValidators),
  notificationController.broadcast,
);

export default router;
