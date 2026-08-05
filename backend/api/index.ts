import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { connectDatabase } from '../src/database/connection';
import { runSeed } from '../src/database/seed';

const app = createApp();

let boot: Promise<void> | null = null;

function ensureBoot(): Promise<void> {
  if (!boot) {
    boot = (async () => {
      await connectDatabase();
      if (env.SEED_ON_BOOT) {
        await runSeed();
      }
    })().catch((error) => {
      boot = null;
      throw error;
    });
  }
  return boot;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureBoot();
  return app(req, res);
}
