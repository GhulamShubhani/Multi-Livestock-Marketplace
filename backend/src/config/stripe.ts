import Stripe from 'stripe';
import { env } from './env';
import { logger } from './logger';

export const isStripeConfigured = Boolean(env.STRIPE_SECRET_KEY);

export const stripe = isStripeConfigured
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-06-24.dahlia' })
  : null;

if (isStripeConfigured) {
  logger.info('Stripe configured');
} else {
  logger.warn('Stripe not configured — payment flows will use development mock mode');
}
