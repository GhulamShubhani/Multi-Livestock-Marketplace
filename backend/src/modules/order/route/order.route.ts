import { Router } from 'express';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import { requireEmailVerified } from '../../auth/middleware/requireEmailVerified';
import {
  createOrderValidators,
  listOrderValidators,
  orderController,
  orderIdParam,
  updateOrderStatusValidators,
} from '../controller/order.controller';

const router = Router();

router.post(
  '/',
  authenticate,
  requireEmailVerified,
  csrfProtection,
  validateRequest(createOrderValidators),
  orderController.create,
);
router.get('/me', authenticate, validateRequest(listOrderValidators), orderController.listMine);
router.get('/me/:id', authenticate, validateRequest(orderIdParam), orderController.getMine);
router.post(
  '/me/:id/cancel',
  authenticate,
  csrfProtection,
  validateRequest(orderIdParam),
  orderController.cancelMine,
);

router.get(
  '/',
  authenticate,
  authorize(PERMISSIONS.ORDERS_READ),
  validateRequest(listOrderValidators),
  orderController.listAdmin,
);
router.get(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.ORDERS_READ),
  validateRequest(orderIdParam),
  orderController.getAdmin,
);
router.patch(
  '/:id/status',
  authenticate,
  authorize(PERMISSIONS.ORDERS_UPDATE),
  csrfProtection,
  validateRequest(updateOrderStatusValidators),
  orderController.updateStatus,
);
router.post(
  '/:id/cancel',
  authenticate,
  authorize(PERMISSIONS.ORDERS_UPDATE),
  csrfProtection,
  validateRequest(orderIdParam),
  orderController.cancelAdmin,
);

export default router;
