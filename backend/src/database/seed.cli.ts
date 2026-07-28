import { connectDatabase, disconnectDatabase } from './connection';
import { runSeed } from './seed';
import { logger } from '../config/logger';

async function main(): Promise<void> {
  await connectDatabase();
  await runSeed();
  await disconnectDatabase();
}

main().catch((error: unknown) => {
  logger.error('Seed failed', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
