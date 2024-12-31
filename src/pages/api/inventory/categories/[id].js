import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const category = await prisma.inventoryCategory.findUnique({
        where: { id },
        include: {
          children: true,
          items: true,
          parent: true
        }
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      return res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      return res.status(500).json({ error: 'Failed to fetch category' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, code, description, parentId } = req.body;

      // Проверяем обязательные поля
      if (!name || !code) {
        return res.status(400).json({ error: 'Name and code are required' });
      }

      // Проверяем уникальность кода, исключая текущую категорию
      const existing = await prisma.inventoryCategory.findFirst({
        where: {
          code,
          NOT: { id }
        }
      });

      if (existing) {
        return res.status(400).json({ error: 'Category with this code already exists' });
      }

      // Обновляем категорию
      const category = await prisma.inventoryCategory.update({
        where: { id },
        data: {
          name,
          code,
          description,
          parentId
        },
        include: {
          parent: true
        }
      });

      return res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({ error: 'Failed to update category' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Проверяем, есть ли подкатегории или товары
      const category = await prisma.inventoryCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              children: true,
              items: true
            }
          }
        }
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      if (category._count.children > 0 || category._count.items > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete category with subcategories or items' 
        });
      }

      // Удаляем категорию
      await prisma.inventoryCategory.delete({
        where: { id }
      });

      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({ error: 'Failed to delete category' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
