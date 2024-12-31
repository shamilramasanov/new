import { prisma } from '../../../../../lib/prisma';

export default async function handle(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { endDate } = req.body;

  try {
    // Проверяем существование ремонта
    const repair = await prisma.vehicleRepair.findUnique({
      where: { id }
    });

    if (!repair) {
      return res.status(404).json({ error: 'Ремонт не знайдено' });
    }

    if (repair.status === 'Завершено') {
      return res.status(400).json({ error: 'Ремонт вже завершено' });
    }

    // Обновляем статус ремонта
    const updatedRepair = await prisma.vehicleRepair.update({
      where: { id },
      data: {
        status: 'Завершено',
        endDate: new Date(endDate || Date.now())
      },
      include: {
        vehicle: true,
        contract: true,
        specifications: true
      }
    });

    return res.json(updatedRepair);
  } catch (error) {
    console.error('Error completing repair:', error);
    return res.status(500).json({ error: error.message || 'Помилка при обробці запиту' });
  }
}
