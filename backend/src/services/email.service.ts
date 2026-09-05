import nodemailer, { type Transporter } from 'nodemailer';
import {
  env,
  isDevelopment,
  primaryFrontendUrl,
  smtpAllowInvalidCerts,
  smtpConfigured,
} from '../config/env';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';

/**
 * Sends auth emails via SMTP when configured.
 * Falls back to console logging when SMTP is missing (local/dev without mail).
 */
export class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    if (!smtpConfigured) return null;
    if (this.transporter) return this.transporter;

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        // Gmail app passwords may be pasted with spaces
        pass: env.SMTP_PASSWORD.replace(/\s+/g, ''),
      },
      tls: {
        // Local Windows antivirus often injects a self-signed cert into the chain
        rejectUnauthorized: !smtpAllowInvalidCerts,
      },
      connectionTimeout: 20_000,
      greetingTimeout: 20_000,
      socketTimeout: 20_000,
    });
    return this.transporter;
  }

  private fromAddress() {
    return env.MAIL_FROM || env.SMTP_USER || 'noreply@livestock-marketplace.local';
  }

  private async sendMail(options: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) {
      logger.warn('SMTP not configured — email not sent (use backend console OTP/link in dev)', {
        to: options.to,
        subject: options.subject,
      });
      return;
    }

    try {
      const info = await transporter.sendMail({
        from: this.fromAddress(),
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      logger.info('Email sent', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Email send failed', {
        to: options.to,
        subject: options.subject,
        error: message,
      });
      throw AppError.badRequest(
        `Could not send email (${message}). In local/dev you can still use the OTP/link printed in the backend console.`,
      );
    }
  }

  async sendEmailVerification(to: string, token: string): Promise<void> {
    const link = `${primaryFrontendUrl}/auth/verify-email?token=${token}`;
    if (isDevelopment) {
      logger.info('Email verification link (dev)', { to, link });
    }

    await this.sendMail({
      to,
      subject: 'Verify your email — Livestock Marketplace',
      text: `Verify your email by opening this link:\n\n${link}\n\nIf you did not create an account, ignore this message.`,
      html: `
        <p>Welcome to Livestock Marketplace.</p>
        <p><a href="${link}">Click here to verify your email</a></p>
        <p>Or paste this link into your browser:</p>
        <p><code>${link}</code></p>
        <p>If you did not create an account, you can ignore this message.</p>
      `,
    });
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const link = `${primaryFrontendUrl}/auth/reset-password?token=${token}`;
    if (isDevelopment) {
      logger.info('Password reset link (dev)', { to, link });
    }

    await this.sendMail({
      to,
      subject: 'Reset your password — Livestock Marketplace',
      text: `Reset your password using this link:\n\n${link}\n\nIf you did not request a reset, ignore this message.`,
      html: `
        <p>Password reset requested.</p>
        <p><a href="${link}">Reset your password</a></p>
        <p>Or paste this link into your browser:</p>
        <p><code>${link}</code></p>
        <p>If you did not request this, ignore this message.</p>
      `,
    });
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    if (isDevelopment) {
      logger.info('OTP code (dev)', { to, otp });
    }

    await this.sendMail({
      to,
      subject: `Your verification code: ${otp}`,
      text: `Your Livestock Marketplace verification code is: ${otp}\n\nThis code expires in 10 minutes.\nIf you did not request it, ignore this message.`,
      html: `
        <p>Your verification code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:0.2em;">${otp}</p>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request it, ignore this message.</p>
      `,
    });
  }
}

export const emailService = new EmailService();
