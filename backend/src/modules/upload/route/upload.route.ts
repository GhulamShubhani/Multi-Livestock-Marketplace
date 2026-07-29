import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { PERMISSIONS } from '../../../constants/auth';
import { HTTP_STATUS } from '../../../constants/httpStatus';
import { csrfProtection } from '../../../middlewares/csrf';
import { validateRequest } from '../../../middlewares/validateRequest';
import { authenticate } from '../../auth/middleware/authenticate';
import { authorize } from '../../auth/middleware/authorize';
import { deleteImageValidators, uploadController } from '../controller/upload.controller';
import {
  handleMulterError,
  uploadMultipleImages,
  uploadSingleImage,
  uploadMultipleVideos,
  uploadSingleVideo,
} from '../middleware/multer.middleware';

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  message: {
    success: false,
    message: 'Upload rate limit exceeded',
    data: null,
    errors: [],
  },
});

const router = Router();

router.use(authenticate, uploadLimiter, csrfProtection);

router.post(
  '/image',
  authorize(PERMISSIONS.UPLOADS_CREATE),
  handleMulterError(uploadSingleImage),
  uploadController.uploadOne,
);
router.post(
  '/images',
  authorize(PERMISSIONS.UPLOADS_CREATE),
  handleMulterError(uploadMultipleImages),
  uploadController.uploadMany,
);

router.post(
  '/video',
  authorize(PERMISSIONS.UPLOADS_CREATE),
  handleMulterError(uploadSingleVideo),
  uploadController.uploadVideo,
);

router.post(
  '/videos',
  authorize(PERMISSIONS.UPLOADS_CREATE),
  handleMulterError(uploadMultipleVideos),
  uploadController.uploadVideos,
);
router.delete(
  '/',
  authorize(PERMISSIONS.UPLOADS_DELETE),
  validateRequest(deleteImageValidators),
  uploadController.remove,
);

export default router;
