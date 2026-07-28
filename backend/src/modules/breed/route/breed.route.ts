import { Router } from 'express';
import { param } from 'express-validator';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  breedController,
  breedListValidators,
  createBreedValidators,
  updateBreedValidators,
} from '../controller/breed.controller';

const router = Router();

router.get('/', validateRequest(breedListValidators), breedController.listPublic);
router.get('/slug/:slug', breedController.getBySlug);

router.get(
  '/admin',
  authenticate,
  authorize(PERMISSIONS.BREEDS_READ),
  validateRequest(breedListValidators),
  breedController.listAdmin,
);
router.get(
  '/admin/:id',
  authenticate,
  authorize(PERMISSIONS.BREEDS_READ),
  validateRequest([param('id').isMongoId()]),
  breedController.getById,
);
router.post(
  '/',
  authenticate,
  authorize(PERMISSIONS.BREEDS_CREATE),
  csrfProtection,
  validateRequest(createBreedValidators),
  breedController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.BREEDS_UPDATE),
  csrfProtection,
  validateRequest(updateBreedValidators),
  breedController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.BREEDS_DELETE),
  csrfProtection,
  validateRequest([param('id').isMongoId()]),
  breedController.remove,
);

export default router;
