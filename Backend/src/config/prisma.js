// ══════════════════════════════════════════════════
// Prisma Client Singleton (v7 — Adapter Pattern)
// Replaces: config/db.js (pg.Pool)
//
// Prisma v7 requires a "driver adapter" instead of
// the old datasourceUrl. We reuse the existing pg
// driver that the project already has installed.
// ══════════════════════════════════════════════════

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Create a pg.Pool (same driver as before, now bridged to Prisma)
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Bridge pg.Pool → Prisma via the adapter
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development'
    ? ['warn', 'error']
    : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});

export default prisma;
