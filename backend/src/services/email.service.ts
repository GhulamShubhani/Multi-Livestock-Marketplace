import { logger } from '../config/logger';
import { env, isDevelopment } from '../config/env';

/**
 * Dev-friendly email service. Replace with Nodemailer/SendGrid in a later phase.
 * Never logs full secrets in production.
 */
export class EmailService {
  async sendEmailVerification(to: string, token: string): Promise<void> {
    const link = `${env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    if (isDevelopment) {
      logger.info('Email verification link (dev)', { to, link });
      return;
    }
    logger.info('Email verification queued', { to });
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const link = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    if (isDevelopment) {
      logger.info('Password reset link (dev)', { to, link });
      return;
    }
    logger.info('Password reset queued', { to });
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    if (isDevelopment) {
      logger.info('OTP code (dev)', { to, otp });
      return;
    }
    logger.info('OTP email queued', { to });
  }
}

export const emailService = new EmailService();
