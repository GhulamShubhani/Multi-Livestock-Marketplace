import { Router } from 'express';
import { PERMISSIONS } from '../../../constants/auth';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate, optionalAuthenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import {
  createEnquiryValidators,
  enquiryController,
  listEnquiryValidators,
  updateEnquiryStatusValidators,
} from '../controller/enquiry.controller';

const router = Router();

router.post(
  '/',
  optionalAuthenticate,
  validateRequest(createEnquiryValidators),
  enquiryController.create,
);

router.get('/me', authenticate, validateRequest(listEnquiryValidators), enquiryController.listMine);
router.get(
  '/seller',
  authenticate,
  validateRequest(listEnquiryValidators),
  enquiryController.listSeller,
);

router.get(
  '/',
  authenticate,
  authorize(PERMISSIONS.ENQUIRIES_READ),
  validateRequest(listEnquiryValidators),
  enquiryController.listAdmin,
);
router.patch(
  '/:id/status',
  authenticate,
  authorize(PERMISSIONS.ENQUIRIES_UPDATE),
  csrfProtection,
  validateRequest(updateEnquiryStatusValidators),
  enquiryController.updateStatus,
);

export default router;
