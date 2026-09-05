import { Router } from 'express';
import { param } from 'express-validator';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  createListingValidators,
  listingController,
  listingListValidators,
  updateListingStatusValidators,
  updateListingValidators,
  verifyListingValidators,
} from '../controller/listing.controller';

const router = Router();

router.get('/', validateRequest(listingListValidators), listingController.listPublic);
/** Listing detail requires a signed-in buyer (storefront + API enforcement). */
router.get('/slug/:slug', authenticate, listingController.getBySlug);

router.get(
  '/admin',
  authenticate,
  authorize(PERMISSIONS.LISTINGS_READ),
  validateRequest(listingListValidators),
  listingController.listAdmin,
);
router.get(
  '/admin/:id',
  authenticate,
  authorize(PERMISSIONS.LISTINGS_READ),
  validateRequest([param('id').isMongoId()]),
  listingController.getById,
);
router.post(
  '/',
  authenticate,
  authorize(PERMISSIONS.LISTINGS_CREATE),
  csrfProtection,
  validateRequest(createListingValidators),
  listingController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.LISTINGS_UPDATE),
  csrfProtection,
  validateRequest(updateListingValidators),
  listingController.update,
);
router.patch(
  '/:id/status',
  authenticate,
  authorize(PERMISSIONS.LISTINGS_UPDATE),
  csrfProtection,
  validateRequest(updateListingStatusValidators),
  listingController.updateStatus,
);
router.patch(
  '/:id/verify',
  authenticate,
  authorize(PERMISSIONS.LISTINGS_VERIFY),
  csrfProtection,
  validateRequest(verifyListingValidators),
  listingController.verify,
);
router.delete(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.LISTINGS_DELETE),
  csrfProtection,
  validateRequest([param('id').isMongoId()]),
  listingController.remove,
);

export default router;
