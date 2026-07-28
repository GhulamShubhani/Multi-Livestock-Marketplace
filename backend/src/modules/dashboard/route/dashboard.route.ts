import { Router } from 'express';
import { PERMISSIONS } from '../../../constants/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  dashboardController,
  salesQueryValidators,
} from '../controller/dashboard.controller';

const router = Router();

router.use(authenticate);

router.get('/overview', authorize(PERMISSIONS.DASHBOARD_READ), dashboardController.overview);
router.get(
  '/sales',
  authorize(PERMISSIONS.REPORTS_READ),
  validateRequest(salesQueryValidators),
  dashboardController.sales,
);
router.get('/inventory', authorize(PERMISSIONS.REPORTS_READ), dashboardController.inventory);

export default router;
