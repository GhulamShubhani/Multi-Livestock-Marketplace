import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '../../../constants/httpStatus';
import { validateRequest } from '../../../middlewares/validateRequest';
import { csrfProtection } from '../../../middlewares/csrf';
import { authController } from '../controller/auth.controller';
import { authenticate } from '../middleware/authenticate';
import {
  forgotPasswordValidators,
  loginValidators,
  otpSendValidators,
  otpVerifyValidators,
  registerValidators,
  resendVerificationValidators,
  resetPasswordValidators,
  verifyEmailValidators,
} from '../validator/auth.validator';

const authSensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    data: null,
    errors: [],
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    data: null,
    errors: [],
  },
});

const router = Router();

router.post('/register', authSensitiveLimiter, validateRequest(registerValidators), authController.register);
router.post('/login', loginLimiter, validateRequest(loginValidators), authController.login);
router.post('/refresh', authController.refresh);
router.post('/verify-email', authSensitiveLimiter, validateRequest(verifyEmailValidators), authController.verifyEmail);
router.post(
  '/resend-verification',
  authSensitiveLimiter,
  validateRequest(resendVerificationValidators),
  authController.resendVerification,
);
router.post(
  '/forgot-password',
  authSensitiveLimiter,
  validateRequest(forgotPasswordValidators),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  authSensitiveLimiter,
  validateRequest(resetPasswordValidators),
  authController.resetPassword,
);
router.post('/otp/send', authSensitiveLimiter, validateRequest(otpSendValidators), authController.sendOtp);
router.post('/otp/verify', authSensitiveLimiter, validateRequest(otpVerifyValidators), authController.verifyOtp);

router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, csrfProtection, authController.logout);
router.post('/logout-all', authenticate, csrfProtection, authController.logoutAll);

export default router;
