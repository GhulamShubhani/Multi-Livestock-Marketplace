import { Router } from 'express';
import { param } from 'express-validator';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  catController,
  catListValidators,
  createCatValidators,
  updateCatStatusValidators,
  updateCatValidators,
} from '../controller/cat.controller';

const router = Router();

router.get('/', validateRequest(catListValidators), catController.listPublic);
router.get('/slug/:slug', catController.getBySlug);

router.get(
  '/admin',
  authenticate,
  authorize(PERMISSIONS.CATS_READ),
  validateRequest(catListValidators),
  catController.listAdmin,
);
router.get(
  '/admin/:id',
  authenticate,
  authorize(PERMISSIONS.CATS_READ),
  validateRequest([param('id').isMongoId()]),
  catController.getById,
);
router.post(
  '/',
  authenticate,
  authorize(PERMISSIONS.CATS_CREATE),
  csrfProtection,
  validateRequest(createCatValidators),
  catController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.CATS_UPDATE),
  csrfProtection,
  validateRequest(updateCatValidators),
  catController.update,
);
router.patch(
  '/:id/status',
  authenticate,
  authorize(PERMISSIONS.CATS_UPDATE),
  csrfProtection,
  validateRequest(updateCatStatusValidators),
  catController.updateStatus,
);
router.delete(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.CATS_DELETE),
  csrfProtection,
  validateRequest([param('id').isMongoId()]),
  catController.remove,
);

export default router;
