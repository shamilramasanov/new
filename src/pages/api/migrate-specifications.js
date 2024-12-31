import { prisma } from '../../lib/prisma';

export default async function handle(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Обновляем все спецификации
    await prisma.specification.updateMany({
      where: {
        OR: [
          { section: null },
          { vehicleBrand: null },
          { vehicleVin: null },
          { vehicleLocation: null }
        ]
      },
      data: {
        section: 'Послуги',
        vehicleBrand: 'Не вказано',
        vehicleVin: 'Не вказано',
        vehicleLocation: 'Не вказано'
      }
    });

    return res.json({ message: 'Міграція завершена успішно' });
  } catch (error) {
    console.error('Error migrating specifications:', error);
    return res.status(500).json({ error: 'Помилка при міграції' });
  }
}
