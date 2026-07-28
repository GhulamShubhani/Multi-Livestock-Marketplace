import { body, param, query } from 'express-validator';
import { SYSTEM_ROLES } from '../../../constants/auth';
import { PASSWORD_POLICY_MESSAGE } from '../../../utils/password';

const passwordRule = (field = 'password') =>
  body(field)
    .isString()
    .isLength({ min: 12 })
    .withMessage(PASSWORD_POLICY_MESSAGE)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/)
    .withMessage(PASSWORD_POLICY_MESSAGE);

export const listUsersValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().isString().isLength({ max: 100 }),
  query('status').optional().isIn(['active', 'inactive', 'banned', 'pending']),
  query('role').optional().isIn(SYSTEM_ROLES),
];

export const userIdParamValidator = [param('id').isMongoId().withMessage('Invalid user id')];

export const sessionIdParamValidator = [
  param('sessionId').isMongoId().withMessage('Invalid session id'),
];

export const addressIdParamValidator = [
  param('addressId').isMongoId().withMessage('Invalid address id'),
];

export const createUserValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  passwordRule('password'),
  body('firstName').trim().notEmpty().isLength({ max: 80 }),
  body('lastName').trim().notEmpty().isLength({ max: 80 }),
  body('phone').optional().isString().isLength({ min: 7, max: 20 }),
  body('roleName').isIn(SYSTEM_ROLES.filter((r) => r !== 'super_admin')).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive', 'banned', 'pending']),
  body('isEmailVerified').optional().isBoolean().toBoolean(),
];

export const updateUserValidators = [
  ...userIdParamValidator,
  body('firstName').optional().trim().notEmpty().isLength({ max: 80 }),
  body('lastName').optional().trim().notEmpty().isLength({ max: 80 }),
  body('phone').optional().isString().isLength({ min: 7, max: 20 }),
  body('roleName').optional().isIn(SYSTEM_ROLES.filter((r) => r !== 'super_admin')),
  body('permissionsOverride').optional().isArray(),
  body('permissionsOverride.*').optional().isString(),
];

export const updateUserStatusValidators = [
  ...userIdParamValidator,
  body('status').isIn(['active', 'inactive', 'banned', 'pending']).withMessage('Invalid status'),
];

export const updateProfileValidators = [
  body('firstName').optional().trim().notEmpty().isLength({ max: 80 }),
  body('lastName').optional().trim().notEmpty().isLength({ max: 80 }),
  body('phone').optional().isString().isLength({ min: 7, max: 20 }),
];

export const changePasswordValidators = [
  body('currentPassword').isString().notEmpty(),
  passwordRule('newPassword'),
];

export const addressValidators = [
  body('label').optional().isString().isLength({ max: 50 }),
  body('line1').trim().notEmpty().withMessage('Address line1 is required'),
  body('line2').optional().isString().isLength({ max: 120 }),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').optional().isString().isLength({ max: 80 }),
  body('postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('isDefault').optional().isBoolean().toBoolean(),
];

export const updateAddressValidators = [
  ...addressIdParamValidator,
  body('label').optional().isString().isLength({ max: 50 }),
  body('line1').optional().trim().notEmpty(),
  body('line2').optional().isString().isLength({ max: 120 }),
  body('city').optional().trim().notEmpty(),
  body('state').optional().isString().isLength({ max: 80 }),
  body('postalCode').optional().trim().notEmpty(),
  body('country').optional().trim().notEmpty(),
  body('isDefault').optional().isBoolean().toBoolean(),
];
