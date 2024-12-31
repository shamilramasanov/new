import { prisma } from '@/lib/prisma';

export default async function handle(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'POST':
        // Получаем спецификацию для проверки остатка
        const specification = await prisma.specification.findUnique({
          where: { id },
          include: { usageHistory: true }
        });

        if (!specification) {
          return res.status(404).json({ error: 'Специфікацію не знайдено' });
        }

        // Вычисляем текущий остаток
        const currentUsage = specification.usageHistory.reduce(
          (total, usage) => total + usage.quantityUsed,
          0
        );
        const remaining = specification.quantity - currentUsage;

        // Проверяем, не превышает ли новое использование остаток
        if (req.body.quantityUsed > remaining) {
          return res.status(400).json({
            error: 'Кількість використання перевищує доступний залишок'
          });
        }

        // Создаем новую запись об использовании
        const usage = await prisma.specificationUsage.create({
          data: {
            date: new Date(req.body.date),
            quantityUsed: req.body.quantityUsed,
            description: req.body.description,
            documentNumber: req.body.documentNumber,
            specification: { connect: { id } }
          }
        });

        // Обновляем остаток в спецификации
        await prisma.specification.update({
          where: { id },
          data: {
            remaining: remaining - req.body.quantityUsed
          }
        });

        return res.json(usage);

      case 'GET':
        // Получаем историю использования спецификации
        const usageHistory = await prisma.specification.findUnique({
          where: { id },
          include: {
            usageHistory: {
              orderBy: { date: 'desc' }
            }
          }
        });

        if (!usageHistory) {
          return res.status(404).json({ error: 'Специфікацію не знайдено' });
        }

        return res.json(usageHistory);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
