import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  console.log('Received request to /api/inventory/categories');
  
  if (req.method === 'GET') {
    try {
      console.log('Fetching categories from database...');
      
      // Получаем все категории с количеством товаров
      const categories = await prisma.inventoryCategory.findMany({
        include: {
          _count: {
            select: {
              items: true
            }
          },
          parent: true,
          children: true
        }
      });

      console.log('Found categories:', categories);
      
      return res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, code, description, parentId } = req.body;

      // Проверяем обязательные поля
      if (!name || !code) {
        return res.status(400).json({ error: 'Name and code are required' });
      }

      // Проверяем уникальность кода
      const existing = await prisma.inventoryCategory.findUnique({
        where: { code }
      });

      if (existing) {
        return res.status(400).json({ error: 'Category with this code already exists' });
      }

      const category = await prisma.inventoryCategory.create({
        data: {
          name,
          code,
          description,
          parentId
        },
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              items: true
            }
          }
        }
      });

      return res.json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
