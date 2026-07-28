import { Router } from 'express';
import { param } from 'express-validator';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  cmsController,
  createCmsValidators,
  listCmsValidators,
  updateCmsValidators,
} from '../controller/cms.controller';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(PERMISSIONS.CMS_READ),
  validateRequest(listCmsValidators),
  cmsController.listAdmin,
);
router.get(
  '/admin/:id',
  authenticate,
  authorize(PERMISSIONS.CMS_READ),
  validateRequest([param('id').isMongoId()]),
  cmsController.getById,
);
router.post(
  '/',
  authenticate,
  authorize(PERMISSIONS.CMS_CREATE),
  csrfProtection,
  validateRequest(createCmsValidators),
  cmsController.create,
);
router.patch(
  '/admin/:id',
  authenticate,
  authorize(PERMISSIONS.CMS_UPDATE),
  csrfProtection,
  validateRequest(updateCmsValidators),
  cmsController.update,
);
router.delete(
  '/admin/:id',
  authenticate,
  authorize(PERMISSIONS.CMS_DELETE),
  csrfProtection,
  validateRequest([param('id').isMongoId()]),
  cmsController.remove,
);

// Public published page — keep after /admin routes
router.get('/:slug', cmsController.getBySlug);

export default router;
