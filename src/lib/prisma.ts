import { PrismaClient } from '@prisma/client'

// Lazily require the adapter to avoid errors when running Prisma CLI locally
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''

  if (databaseUrl.startsWith('libsql://')) {
    // Use PrismaLibSQL adapter for Turso/libsql at runtime
    // Import dynamically to keep Prisma CLI unaffected
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    const adapter = new PrismaLibSQL({ url: databaseUrl, authToken: process.env.TURSO_AUTH_TOKEN })
    return new PrismaClient({ adapter })
  }

  // Default Prisma client (uses SQLite local file from DATABASE_URL)
  return new PrismaClient()
}

const prisma = createPrismaClient()

export default prisma
