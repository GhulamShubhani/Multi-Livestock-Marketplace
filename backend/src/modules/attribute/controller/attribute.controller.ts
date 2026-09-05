import type { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { ATTRIBUTE_TYPES } from '../interface/attribute.interface';
import { attributeService } from '../service/attribute.service';

export class AttributeController {
  listByCategory = asyncHandler(async (req: Request, res: Response) => {
    const attributes = await attributeService.listPublicByCategory(req.params.categoryId);
    return ApiResponse.success(res, { attributes }, 'OK');
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await attributeService.listAdmin(req.query as Record<string, unknown>);
    return ApiResponse.success(res, { attributes: result.items }, 'OK', 200, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const attribute = await attributeService.getById(req.params.id);
    return ApiResponse.success(res, { attribute }, 'OK');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const attribute = await attributeService.create(req.body, req.user!.id);
    return ApiResponse.created(res, { attribute }, 'Attribute created');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const attribute = await attributeService.update(req.params.id, req.body, req.user!.id);
    return ApiResponse.success(res, { attribute }, 'Attribute updated');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await attributeService.remove(req.params.id, req.user!.id);
    return ApiResponse.success(res, null, 'Attribute deleted');
  });
}

export const attributeController = new AttributeController();

export const attributeListValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('q').optional().isString().isLength({ max: 100 }),
  query('categoryId').optional().isMongoId(),
  query('activeOnly').optional().isIn(['true', 'false']),
];

export const createAttributeValidators = [
  body('name').trim().notEmpty().isLength({ max: 120 }),
  body('slug').optional().isString().isLength({ max: 140 }),
  body('key').trim().notEmpty().isLength({ max: 80 }),
  body('label').trim().notEmpty().isLength({ max: 120 }),
  body('type').isIn([...ATTRIBUTE_TYPES]),
  body('unit').optional().isString().isLength({ max: 40 }),
  body('options').optional().isArray({ max: 100 }),
  body('options.*').optional().isString().isLength({ max: 120 }),
  body('required').optional().isBoolean().toBoolean(),
  body('categoryIds').optional().isArray(),
  body('categoryIds.*').optional().isMongoId(),
  body('sortOrder').optional().isInt().toInt(),
  body('isActive').optional().isBoolean().toBoolean(),
  body('filterable').optional().isBoolean().toBoolean(),
  body('showOnCard').optional().isBoolean().toBoolean(),
];

export const updateAttributeValidators = [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty().isLength({ max: 120 }),
  body('key').optional().trim().notEmpty().isLength({ max: 80 }),
  body('label').optional().trim().notEmpty().isLength({ max: 120 }),
  body('type')
    .optional()
    .isIn([...ATTRIBUTE_TYPES]),
  body('categoryIds').optional().isArray(),
  body('categoryIds.*').optional().isMongoId(),
  body('isActive').optional().isBoolean().toBoolean(),
  body('filterable').optional().isBoolean().toBoolean(),
  body('showOnCard').optional().isBoolean().toBoolean(),
];
