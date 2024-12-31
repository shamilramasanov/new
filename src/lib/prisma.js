import { PrismaClient } from '@prisma/client'

let prisma

try {
  prisma = global.prisma || new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

  if (process.env.NODE_ENV === 'development') {
    global.prisma = prisma
  }
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
  throw error
}

export { prisma }
