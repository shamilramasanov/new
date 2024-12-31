import { prisma } from '@/lib/prisma';

export default async function handle(req, res) {
  const { id } = req.query;

  try {
    // Получаем контракт со спецификациями и актами
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        specifications: {
          include: {
            actItems: true,
          },
        },
      },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Разделяем спецификации на услуги и запчасти
    const availability = {
      services: [],
      parts: [],
    };

    for (const spec of contract.specifications) {
      if (spec.section === 'Послуги') {
        // Для услуг проверяем использованные номера обслуживаний
        const usedServices = spec.actItems.map(item => item.serviceCount).filter(Boolean);
        const totalServices = spec.serviceCount || 1;
        const availableServices = Array.from(
          { length: totalServices },
          (_, i) => i + 1
        ).filter(num => !usedServices.includes(num));

        availability.services.push({
          id: spec.id,
          name: spec.name,
          serviceCount: totalServices,
          usedServices,
          availableServices,
        });
      } else {
        // Для запчастей считаем оставшееся количество
        const usedQuantity = spec.actItems.reduce((sum, item) => sum + item.quantity, 0);
        const availableQuantity = Math.max(0, spec.quantity - usedQuantity);

        availability.parts.push({
          id: spec.id,
          name: spec.name,
          code: spec.code,
          totalQuantity: spec.quantity,
          usedQuantity,
          availableQuantity,
        });
      }
    }

    res.json(availability);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
