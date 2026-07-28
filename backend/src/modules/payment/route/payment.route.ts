import { Router } from 'express';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import { requireEmailVerified } from '../../auth/middleware/requireEmailVerified';
import {
  listPaymentValidators,
  mockCompleteValidators,
  orderIdBodyValidators,
  paymentController,
  refundValidators,
} from '../controller/payment.controller';

const router = Router();

router.post(
  '/checkout-session',
  authenticate,
  requireEmailVerified,
  csrfProtection,
  validateRequest(orderIdBodyValidators),
  paymentController.checkoutSession,
);
router.post(
  '/payment-intent',
  authenticate,
  requireEmailVerified,
  csrfProtection,
  validateRequest(orderIdBodyValidators),
  paymentController.paymentIntent,
);
router.post(
  '/mock-complete',
  authenticate,
  requireEmailVerified,
  csrfProtection,
  validateRequest(mockCompleteValidators),
  paymentController.mockComplete,
);

router.get('/me', authenticate, validateRequest(listPaymentValidators), paymentController.listMine);

router.get(
  '/',
  authenticate,
  authorize(PERMISSIONS.PAYMENTS_READ),
  validateRequest(listPaymentValidators),
  paymentController.listAdmin,
);
router.post(
  '/:id/refund',
  authenticate,
  authorize(PERMISSIONS.PAYMENTS_REFUND),
  csrfProtection,
  validateRequest(refundValidators),
  paymentController.refund,
);

export default router;
