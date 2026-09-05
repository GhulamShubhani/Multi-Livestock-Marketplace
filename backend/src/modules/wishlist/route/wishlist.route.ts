import { Router } from 'express';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { listingIdParam, wishlistController } from '../controller/wishlist.controller';

const router = Router();

router.use(authenticate);

router.get('/', wishlistController.get);
router.post('/:listingId', csrfProtection, validateRequest(listingIdParam), wishlistController.add);
router.delete(
  '/:listingId',
  csrfProtection,
  validateRequest(listingIdParam),
  wishlistController.remove,
);

export default router;
