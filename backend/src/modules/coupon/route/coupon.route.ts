import { Router } from 'express';
import { param } from 'express-validator';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  couponController,
  createCouponValidators,
  listCouponValidators,
  updateCouponValidators,
  validateCouponValidators,
} from '../controller/coupon.controller';

const router = Router();

router.post(
  '/validate',
  authenticate,
  csrfProtection,
  validateRequest(validateCouponValidators),
  couponController.validate,
);

router.get(
  '/',
  authenticate,
  authorize(PERMISSIONS.COUPONS_READ),
  validateRequest(listCouponValidators),
  couponController.list,
);
router.post(
  '/',
  authenticate,
  authorize(PERMISSIONS.COUPONS_CREATE),
  csrfProtection,
  validateRequest(createCouponValidators),
  couponController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.COUPONS_UPDATE),
  csrfProtection,
  validateRequest(updateCouponValidators),
  couponController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.COUPONS_DELETE),
  csrfProtection,
  validateRequest([param('id').isMongoId()]),
  couponController.remove,
);

export default router;
