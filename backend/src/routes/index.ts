import { Router } from 'express';
import healthRouter from './health.route';
import authRouter from '../modules/auth/route/auth.route';
import userRouter from '../modules/user/route/user.route';
import profileRouter from '../modules/user/route/profile.route';
import categoryRouter from '../modules/category/route/category.route';
import breedRouter from '../modules/breed/route/breed.route';
import catRouter from '../modules/cat/route/cat.route';
import uploadRouter from '../modules/upload/route/upload.route';
import wishlistRouter from '../modules/wishlist/route/wishlist.route';
import couponRouter from '../modules/coupon/route/coupon.route';
import orderRouter from '../modules/order/route/order.route';
import paymentRouter from '../modules/payment/route/payment.route';
import reviewRouter from '../modules/review/route/review.route';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/profile', profileRouter);
router.use('/categories', categoryRouter);
router.use('/breeds', breedRouter);
router.use('/cats', catRouter);
router.use('/uploads', uploadRouter);
router.use('/wishlist', wishlistRouter);
router.use('/coupons', couponRouter);
router.use('/orders', orderRouter);
router.use('/payments', paymentRouter);
router.use('/reviews', reviewRouter);

export default router;
