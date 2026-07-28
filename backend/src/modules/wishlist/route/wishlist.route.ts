import { Router } from 'express';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { catIdParam, wishlistController } from '../controller/wishlist.controller';

const router = Router();

router.use(authenticate);

router.get('/', wishlistController.get);
router.post('/:catId', csrfProtection, validateRequest(catIdParam), wishlistController.add);
router.delete('/:catId', csrfProtection, validateRequest(catIdParam), wishlistController.remove);

export default router;
