import { Router } from 'express';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  categoryController,
  categoryListValidators,
  createCategoryValidators,
  updateCategoryValidators,
} from '../controller/category.controller';
import { param } from 'express-validator';

const router = Router();

router.get('/', validateRequest(categoryListValidators), categoryController.listPublic);
router.get('/slug/:slug', categoryController.getBySlug);

router.get(
  '/admin',
  authenticate,
  authorize(PERMISSIONS.CATEGORIES_READ),
  validateRequest(categoryListValidators),
  categoryController.listAdmin,
);
router.get(
  '/admin/:id',
  authenticate,
  authorize(PERMISSIONS.CATEGORIES_READ),
  validateRequest([param('id').isMongoId()]),
  categoryController.getById,
);
router.post(
  '/',
  authenticate,
  authorize(PERMISSIONS.CATEGORIES_CREATE),
  csrfProtection,
  validateRequest(createCategoryValidators),
  categoryController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.CATEGORIES_UPDATE),
  csrfProtection,
  validateRequest(updateCategoryValidators),
  categoryController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.CATEGORIES_DELETE),
  csrfProtection,
  validateRequest([param('id').isMongoId()]),
  categoryController.remove,
);

export default router;
