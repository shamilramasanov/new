import { prisma } from '../lib/prisma';

export async function getOrCreateTestUser() {
  let user = await prisma.user.findFirst();
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
  }
  
  return user;
}
