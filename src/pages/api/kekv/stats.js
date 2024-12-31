import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Получаем все КЕКВ из всех бюджетов
    const kekvs = await prisma.kEKV.findMany({
      select: {
        code: true,
        plannedAmount: true,
        usedAmount: true,
      },
    });

    // Группируем данные по кодам КЕКВ
    const stats = kekvs.reduce((acc, kekv) => {
      if (!acc[kekv.code]) {
        acc[kekv.code] = {
          plannedTotal: 0,
          usedTotal: 0,
        };
      }
      
      acc[kekv.code].plannedTotal += kekv.plannedAmount;
      acc[kekv.code].usedTotal += kekv.usedAmount;
      
      return acc;
    }, {});

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching KEKV stats:', error);
    res.status(500).json({ message: 'Error fetching KEKV stats' });
  }
}
