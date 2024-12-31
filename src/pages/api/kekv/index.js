import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { budgetId } = req.query;

  if (!budgetId) {
    return res.status(400).json({ message: 'Budget ID is required' });
  }

  try {
    const kekv = await prisma.kEKV.findMany({
      where: {
        budgetId: budgetId,
      },
    });

    if (!kekv || kekv.length === 0) {
      return res.status(404).json({ message: 'KEKV not found for this budget' });
    }

    return res.json(kekv);
  } catch (error) {
    console.error('Error fetching KEKV:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
