import { Router } from 'express';
import { PERMISSIONS } from '../../../constants/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { csrfProtection } from '../../../middlewares/csrf';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import { userController } from '../controller/user.controller';
import {
  createUserValidators,
  listUsersValidators,
  sessionIdParamValidator,
  updateUserStatusValidators,
  updateUserValidators,
  userIdParamValidator,
} from '../validator/user.validator';

const router = Router();

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.USERS_READ), validateRequest(listUsersValidators), userController.list);
router.get(
  '/:id',
  authorize(PERMISSIONS.USERS_READ),
  validateRequest(userIdParamValidator),
  userController.getById,
);
router.post(
  '/',
  authorize(PERMISSIONS.USERS_CREATE),
  csrfProtection,
  validateRequest(createUserValidators),
  userController.create,
);
router.patch(
  '/:id',
  authorize(PERMISSIONS.USERS_UPDATE),
  csrfProtection,
  validateRequest(updateUserValidators),
  userController.update,
);
router.patch(
  '/:id/status',
  authorize(PERMISSIONS.USERS_UPDATE),
  csrfProtection,
  validateRequest(updateUserStatusValidators),
  userController.updateStatus,
);
router.delete(
  '/:id',
  authorize(PERMISSIONS.USERS_DELETE),
  csrfProtection,
  validateRequest(userIdParamValidator),
  userController.remove,
);
router.get(
  '/:id/sessions',
  authorize(PERMISSIONS.USERS_READ),
  validateRequest(userIdParamValidator),
  userController.listSessions,
);
router.delete(
  '/:id/sessions',
  authorize(PERMISSIONS.USERS_UPDATE),
  csrfProtection,
  validateRequest(userIdParamValidator),
  userController.revokeAllSessions,
);
router.delete(
  '/:id/sessions/:sessionId',
  authorize(PERMISSIONS.USERS_UPDATE),
  csrfProtection,
  validateRequest([...userIdParamValidator, ...sessionIdParamValidator]),
  userController.revokeSession,
);

export default router;
