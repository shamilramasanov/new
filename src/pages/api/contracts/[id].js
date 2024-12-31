import { prisma } from '../../../lib/prisma';

export default async function handle(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        const contract = await prisma.contract.findUnique({
          where: { id },
          include: {
            specifications: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
                quantity: true,
                price: true,
                amount: true,
                section: true,
                serviceCount: true,
                actItems: {
                  where: {
                    act: {
                      status: 'ACTIVE'
                    }
                  },
                  select: {
                    quantity: true,
                    serviceCount: true,
                  }
                }
              }
            },
            acts: {
              select: {
                id: true,
                number: true,
                date: true,
                status: true,
                totalAmount: true,
                actItems: {
                  include: {
                    specification: true,
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            },
            vehicle: {
              select: {
                number: true,
                brand: true,
                model: true,
              }
            },
            kekv: true,
            budget: true,
          }
        });

        if (!contract) {
          return res.status(404).json({ error: 'Договір не знайдено' });
        }

        // Подсчитываем остатки по спецификациям
        const specificationsWithRemains = contract.specifications.map(spec => {
          // Считаем только по активным актам
          const usedQuantity = spec.actItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
          const usedServiceCount = spec.actItems.reduce((sum, item) => sum + (item.serviceCount || 0), 0);
          
          return {
            ...spec,
            remainingQuantity: spec.quantity - usedQuantity,
            remainingServiceCount: spec.serviceCount - usedServiceCount,
            usedQuantity,
            usedServiceCount
          };
        });

        // Считаем общую сумму по активным актам
        const usedAmount = contract.acts
          .filter(act => act.status === 'ACTIVE')
          .reduce((sum, act) => sum + act.totalAmount, 0);

        res.json({
          ...contract,
          specifications: specificationsWithRemains,
          usedAmount,
          remainingAmount: contract.amount - usedAmount
        });
        break;

      case 'PUT':
        const { status, number, startDate, endDate } = req.body;

        // Валидация при изменении статуса на ACTIVE
        if (status === 'ACTIVE') {
          if (!number || !startDate || !endDate) {
            return res.status(400).json({
              error: 'Для активації договору необхідно вказати номер та дати'
            });
          }
        }

        const updatedStatusContract = await prisma.contract.update({
          where: { id },
          data: {
            status,
            ...(status === 'ACTIVE' && {
              number,
              startDate: new Date(startDate),
              endDate: new Date(endDate)
            })
          },
          include: {
            budget: {
              include: {
                kekvs: true
              }
            },
            kekv: true,
            specifications: true
          }
        });

        return res.json(updatedStatusContract);

      case 'DELETE':
        await prisma.contract.delete({
          where: { id }
        });

        return res.json({ message: 'Договір видалено' });

      default:
        throw new Error(`The HTTP ${req.method} method is not supported at this route.`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
