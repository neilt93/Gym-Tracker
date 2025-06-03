// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client'

// Prevent multiple instances during development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // optional: logs all SQL queries
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
