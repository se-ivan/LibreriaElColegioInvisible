import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

// Create Prisma client with libsql adapter for Turso
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''

  if (databaseUrl.startsWith('libsql://')) {
    // Extract auth token from URL if present, or use separate env var
    const url = new URL(databaseUrl)
    const authToken = url.searchParams.get('authToken') || process.env.TURSO_AUTH_TOKEN || ''
    
    // Remove authToken from URL for adapter config
    url.searchParams.delete('authToken')
    const cleanUrl = url.toString()

    // Create adapter with config (not client instance)
    const adapter = new PrismaLibSQL({
      url: cleanUrl,
      authToken: authToken,
    })
    
    return new PrismaClient({ adapter })
  }

  // Fallback for local SQLite (if needed for migrations)
  return new PrismaClient()
}

const prisma = createPrismaClient()

export default prisma
