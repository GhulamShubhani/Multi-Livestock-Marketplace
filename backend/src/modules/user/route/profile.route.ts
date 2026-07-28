import { Router } from 'express';
import { validateRequest } from '../../../middlewares/validateRequest';
import { csrfProtection } from '../../../middlewares/csrf';
import { authenticate } from '../../auth/middleware/authenticate';
import { profileController } from '../controller/profile.controller';
import {
  addressIdParamValidator,
  addressValidators,
  changePasswordValidators,
  sessionIdParamValidator,
  updateAddressValidators,
  updateProfileValidators,
} from '../validator/user.validator';

const router = Router();

router.use(authenticate);

router.get('/', profileController.get);
router.patch('/', csrfProtection, validateRequest(updateProfileValidators), profileController.update);
router.patch(
  '/password',
  csrfProtection,
  validateRequest(changePasswordValidators),
  profileController.changePassword,
);

router.get('/addresses', profileController.listAddresses);
router.post('/addresses', csrfProtection, validateRequest(addressValidators), profileController.addAddress);
router.patch(
  '/addresses/:addressId',
  csrfProtection,
  validateRequest(updateAddressValidators),
  profileController.updateAddress,
);
router.delete(
  '/addresses/:addressId',
  csrfProtection,
  validateRequest(addressIdParamValidator),
  profileController.deleteAddress,
);

router.get('/sessions', profileController.listSessions);
router.delete('/sessions', csrfProtection, profileController.revokeAllSessions);
router.delete(
  '/sessions/:sessionId',
  csrfProtection,
  validateRequest(sessionIdParamValidator),
  profileController.revokeSession,
);

export default router;
