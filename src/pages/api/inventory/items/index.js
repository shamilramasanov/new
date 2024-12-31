import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const items = await prisma.inventoryItem.findMany({
        include: {
          category: true,
          unit: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Преобразуем даты в строки для безопасной сериализации
      const sanitizedItems = items.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }));

      return res.json(sanitizedItems);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        name, 
        code, 
        description, 
        quantity, 
        minQuantity, 
        price,
        categoryId,
        unitId,
        location 
      } = req.body;

      // Проверяем обязательные поля
      if (!name || !code || !categoryId || !unitId) {
        return res.status(400).json({ 
          error: 'Name, code, category and unit are required' 
        });
      }

      // Проверяем уникальность кода
      const existing = await prisma.inventoryItem.findUnique({
        where: { code }
      });

      if (existing) {
        return res.status(400).json({ 
          error: 'Item with this code already exists' 
        });
      }

      const item = await prisma.inventoryItem.create({
        data: {
          name,
          code,
          description,
          quantity: quantity || 0,
          minQuantity,
          price,
          categoryId,
          unitId,
          location
        },
        include: {
          category: true,
          unit: true
        }
      });

      return res.json(item);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
