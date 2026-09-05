import { Router } from 'express';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import { requireEmailVerified } from '../../auth/middleware/requireEmailVerified';
import {
  listPaymentValidators,
  paymentController,
  refundValidators,
  submitPaymentValidators,
  verifyPaymentValidators,
} from '../controller/payment.controller';

const router = Router();

router.get('/methods', paymentController.methods);

router.post(
  '/submit',
  authenticate,
  requireEmailVerified,
  csrfProtection,
  validateRequest(submitPaymentValidators),
  paymentController.submit,
);

router.get('/me', authenticate, validateRequest(listPaymentValidators), paymentController.listMine);

router.get(
  '/',
  authenticate,
  authorize(PERMISSIONS.PAYMENTS_READ),
  validateRequest(listPaymentValidators),
  paymentController.listAdmin,
);
router.patch(
  '/:id/verify',
  authenticate,
  authorize(PERMISSIONS.PAYMENTS_VERIFY),
  csrfProtection,
  validateRequest(verifyPaymentValidators),
  paymentController.verify,
);
router.patch(
  '/:id/refund',
  authenticate,
  authorize(PERMISSIONS.PAYMENTS_REFUND),
  csrfProtection,
  validateRequest(refundValidators),
  paymentController.refund,
);

export default router;
