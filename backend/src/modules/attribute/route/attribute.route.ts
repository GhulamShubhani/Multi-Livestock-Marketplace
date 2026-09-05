import { Router } from 'express';
import { param } from 'express-validator';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  attributeController,
  attributeListValidators,
  createAttributeValidators,
  updateAttributeValidators,
} from '../controller/attribute.controller';

const router = Router();

router.get(
  '/category/:categoryId',
  validateRequest([param('categoryId').isMongoId()]),
  attributeController.listByCategory,
);

router.get(
  '/admin',
  authenticate,
  authorize(PERMISSIONS.ATTRIBUTES_READ),
  validateRequest(attributeListValidators),
  attributeController.listAdmin,
);
router.get(
  '/admin/:id',
  authenticate,
  authorize(PERMISSIONS.ATTRIBUTES_READ),
  validateRequest([param('id').isMongoId()]),
  attributeController.getById,
);
router.post(
  '/',
  authenticate,
  authorize(PERMISSIONS.ATTRIBUTES_CREATE),
  csrfProtection,
  validateRequest(createAttributeValidators),
  attributeController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.ATTRIBUTES_UPDATE),
  csrfProtection,
  validateRequest(updateAttributeValidators),
  attributeController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.ATTRIBUTES_DELETE),
  csrfProtection,
  validateRequest([param('id').isMongoId()]),
  attributeController.remove,
);

export default router;
