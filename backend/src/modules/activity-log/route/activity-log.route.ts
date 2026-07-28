import { Router } from 'express';
import { PERMISSIONS } from '../../../constants/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  activityLogController,
  listActivityLogValidators,
} from '../controller/activity-log.controller';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(PERMISSIONS.ACTIVITY_LOGS_READ),
  validateRequest(listActivityLogValidators),
  activityLogController.list,
);

export default router;
