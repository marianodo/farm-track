import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    // Railway's public TCP proxy intermittently drops connections; retry the
    // initial connect with backoff and, if it still fails, start anyway and let
    // Prisma connect lazily on the first query instead of crashing the app.
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(
          `[PrismaService] DB connect attempt ${attempt}/${maxRetries} failed: ${msg}`,
        );
        if (attempt === maxRetries) {
          console.error(
            '[PrismaService] Could not establish initial DB connection; continuing (will connect lazily on first query).',
          );
          return;
        }
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
