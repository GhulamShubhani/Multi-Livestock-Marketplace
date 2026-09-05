import { Router } from 'express';
import { param } from 'express-validator';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  createSellerValidators,
  sellerController,
  sellerListValidators,
  updateSellerValidators,
} from '../controller/seller.controller';

const router = Router();

router.get('/', validateRequest(sellerListValidators), sellerController.listPublic);
router.get('/me', authenticate, sellerController.getMine);
router.put(
  '/me',
  authenticate,
  csrfProtection,
  validateRequest(createSellerValidators),
  sellerController.upsertMine,
);

router.get(
  '/admin',
  authenticate,
  authorize(PERMISSIONS.SELLERS_READ),
  validateRequest(sellerListValidators),
  sellerController.listAdmin,
);
router.get(
  '/admin/:id',
  authenticate,
  authorize(PERMISSIONS.SELLERS_READ),
  validateRequest([param('id').isMongoId()]),
  sellerController.getById,
);
router.post(
  '/',
  authenticate,
  authorize(PERMISSIONS.SELLERS_UPDATE),
  csrfProtection,
  validateRequest(createSellerValidators),
  sellerController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.SELLERS_UPDATE),
  csrfProtection,
  validateRequest(updateSellerValidators),
  sellerController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.SELLERS_UPDATE),
  csrfProtection,
  validateRequest([param('id').isMongoId()]),
  sellerController.remove,
);

export default router;
