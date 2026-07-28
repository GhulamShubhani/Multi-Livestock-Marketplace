import type { Request, Response } from 'express';
import { param } from 'express-validator';
import { ApiResponse } from '../../../utils/ApiResponse';
import { asyncHandler } from '../../../utils/asyncHandler';
import { wishlistService } from '../service/wishlist.service';

export class WishlistController {
  get = asyncHandler(async (req: Request, res: Response) => {
    const wishlist = await wishlistService.get(req.user!.id);
    return ApiResponse.success(res, { wishlist }, 'OK');
  });

  add = asyncHandler(async (req: Request, res: Response) => {
    const wishlist = await wishlistService.add(req.user!.id, req.params.catId);
    return ApiResponse.success(res, { wishlist }, 'Added to wishlist');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const wishlist = await wishlistService.remove(req.user!.id, req.params.catId);
    return ApiResponse.success(res, { wishlist }, 'Removed from wishlist');
  });
}

export const wishlistController = new WishlistController();
export const catIdParam = [param('catId').isMongoId().withMessage('Invalid cat id')];
