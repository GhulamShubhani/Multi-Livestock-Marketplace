import { Router } from 'express';
import healthRouter from './health.route';
import authRouter from '../modules/auth/route/auth.route';
import userRouter from '../modules/user/route/user.route';
import profileRouter from '../modules/user/route/profile.route';
import categoryRouter from '../modules/category/route/category.route';
import breedRouter from '../modules/breed/route/breed.route';
import catRouter from '../modules/cat/route/cat.route';
import uploadRouter from '../modules/upload/route/upload.route';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/profile', profileRouter);
router.use('/categories', categoryRouter);
router.use('/breeds', breedRouter);
router.use('/cats', catRouter);
router.use('/uploads', uploadRouter);

export default router;
