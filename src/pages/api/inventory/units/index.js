import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const units = await prisma.unit.findMany({
        include: {
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return res.json(units);
    } catch (error) {
      console.error('Error fetching units:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, code } = req.body;

      // Проверяем обязательные поля
      if (!name || !code) {
        return res.status(400).json({ error: 'Name and code are required' });
      }

      // Проверяем уникальность кода
      const existing = await prisma.unit.findUnique({
        where: { code }
      });

      if (existing) {
        return res.status(400).json({ error: 'Unit with this code already exists' });
      }

      const unit = await prisma.unit.create({
        data: {
          name,
          code
        },
        include: {
          _count: {
            select: {
              items: true
            }
          }
        }
      });

      return res.json(unit);
    } catch (error) {
      console.error('Error creating unit:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
