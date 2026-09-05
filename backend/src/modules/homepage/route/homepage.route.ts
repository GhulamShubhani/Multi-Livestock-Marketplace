import { Router } from 'express';
import { param } from 'express-validator';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  createHomepageValidators,
  homepageController,
  homepageListValidators,
  reorderHomepageValidators,
  updateHomepageValidators,
} from '../controller/homepage.controller';

const router = Router();

router.get('/', homepageController.listPublic);

router.get(
  '/admin',
  authenticate,
  authorize(PERMISSIONS.HOMEPAGE_READ),
  validateRequest(homepageListValidators),
  homepageController.listAdmin,
);
router.get(
  '/admin/:id',
  authenticate,
  authorize(PERMISSIONS.HOMEPAGE_READ),
  validateRequest([param('id').isMongoId()]),
  homepageController.getById,
);
router.post(
  '/',
  authenticate,
  authorize(PERMISSIONS.HOMEPAGE_CREATE),
  csrfProtection,
  validateRequest(createHomepageValidators),
  homepageController.create,
);
router.patch(
  '/reorder',
  authenticate,
  authorize(PERMISSIONS.HOMEPAGE_UPDATE),
  csrfProtection,
  validateRequest(reorderHomepageValidators),
  homepageController.reorder,
);
router.patch(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.HOMEPAGE_UPDATE),
  csrfProtection,
  validateRequest(updateHomepageValidators),
  homepageController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.HOMEPAGE_DELETE),
  csrfProtection,
  validateRequest([param('id').isMongoId()]),
  homepageController.remove,
);

export default router;
