import { Router } from 'express';
import { param } from 'express-validator';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  bannerController,
  createBannerValidators,
  listBannerValidators,
  updateBannerValidators,
} from '../controller/banner.controller';

const router = Router();

router.get('/', validateRequest(listBannerValidators), bannerController.listPublic);

router.get(
  '/admin',
  authenticate,
  authorize(PERMISSIONS.BANNERS_READ),
  validateRequest(listBannerValidators),
  bannerController.listAdmin,
);
router.get(
  '/admin/:id',
  authenticate,
  authorize(PERMISSIONS.BANNERS_READ),
  validateRequest([param('id').isMongoId()]),
  bannerController.getById,
);
router.post(
  '/',
  authenticate,
  authorize(PERMISSIONS.BANNERS_CREATE),
  csrfProtection,
  validateRequest(createBannerValidators),
  bannerController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.BANNERS_UPDATE),
  csrfProtection,
  validateRequest(updateBannerValidators),
  bannerController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.BANNERS_DELETE),
  csrfProtection,
  validateRequest([param('id').isMongoId()]),
  bannerController.remove,
);

export default router;
