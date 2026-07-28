import { Router } from 'express';
import { param } from 'express-validator';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  createReviewValidators,
  listReviewValidators,
  moderateReviewValidators,
  reviewController,
} from '../controller/review.controller';

const router = Router();

router.get('/', validateRequest(listReviewValidators), reviewController.listPublic);

router.get(
  '/admin',
  authenticate,
  authorize(PERMISSIONS.REVIEWS_MODERATE),
  validateRequest(listReviewValidators),
  reviewController.listAdmin,
);

router.post(
  '/',
  authenticate,
  csrfProtection,
  validateRequest(createReviewValidators),
  reviewController.create,
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(PERMISSIONS.REVIEWS_MODERATE),
  csrfProtection,
  validateRequest(moderateReviewValidators),
  reviewController.moderate,
);

router.delete(
  '/:id',
  authenticate,
  csrfProtection,
  validateRequest([param('id').isMongoId()]),
  reviewController.remove,
);

export default router;
