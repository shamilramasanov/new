import { PrismaClient } from '@prisma/client'

let prisma

try {
  prisma = global.prisma || new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  if (process.env.NODE_ENV === 'development') {
    global.prisma = prisma
  }
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
  console.error('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
  throw error
}

export { prisma }
