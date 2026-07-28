import { Router } from 'express';
import healthRouter from './health.route';
import authRouter from '../modules/auth/route/auth.route';
import userRouter from '../modules/user/route/user.route';
import profileRouter from '../modules/user/route/profile.route';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/profile', profileRouter);

export default router;
