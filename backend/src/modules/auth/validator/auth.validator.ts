import { body } from 'express-validator';
import { PASSWORD_POLICY_MESSAGE } from '../../../utils/password';

const passwordRule = body('password')
  .isString()
  .isLength({ min: 12 })
  .withMessage(PASSWORD_POLICY_MESSAGE)
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/)
  .withMessage(PASSWORD_POLICY_MESSAGE);

export const registerValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  passwordRule,
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 80 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 80 }),
  body('phone').optional().isString().isLength({ min: 7, max: 20 }),
];

export const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

export const verifyEmailValidators = [
  body('token').isString().notEmpty().withMessage('Token is required'),
];

export const forgotPasswordValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const resetPasswordValidators = [
  body('token').isString().notEmpty().withMessage('Token is required'),
  passwordRule,
];

export const otpSendValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const otpVerifyValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').isString().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric(),
];

export const resendVerificationValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];
