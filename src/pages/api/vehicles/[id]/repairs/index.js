import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Получаем все спецификации для данного автомобиля
      const specifications = await prisma.specification.findMany({
        where: {
          vehicleId: id,
          contract: {
            kekv: {
              code: '2240'
            }
          }
        },
        include: {
          contract: {
            include: {
              kekv: true,
              acts: {
                select: {
                  id: true,
                  number: true,
                  date: true,
                  status: true,
                  totalAmount: true
                }
              }
            }
          }
        },
        orderBy: {
          contract: {
            startDate: 'desc'
          }
        }
      });

      // Группируем спецификации по договорам
      const contractsMap = new Map();
      specifications.forEach(spec => {
        if (!contractsMap.has(spec.contract.id)) {
          contractsMap.set(spec.contract.id, {
            id: spec.contract.id,
            number: spec.contract.number,
            contractor: spec.contract.contractor,
            startDate: spec.contract.startDate,
            endDate: spec.contract.endDate,
            status: spec.contract.status,
            kekv: {
              code: spec.contract.kekv.code,
              name: spec.contract.kekv.name
            },
            acts: spec.contract.acts,
            specifications: []
          });
        }
        contractsMap.get(spec.contract.id).specifications.push({
          id: spec.id,
          name: spec.name,
          code: spec.code,
          unit: spec.unit,
          quantity: spec.quantity,
          price: spec.price,
          type: spec.type,
          serviceCount: spec.serviceCount,
          vehicleBrand: spec.vehicleBrand,
          vehicleVin: spec.vehicleVin,
          vehicleLocation: spec.vehicleLocation,
          amount: spec.price * spec.quantity * (spec.type === 'service' ? spec.serviceCount : 1)
        });
      });

      // Преобразуем Map в массив и добавляем общую сумму для каждого договора
      const repairsWithTotals = Array.from(contractsMap.values()).map(contract => ({
        ...contract,
        amount: contract.specifications.reduce((sum, spec) => sum + spec.amount, 0)
      }));

      return res.json(repairsWithTotals);
    } catch (error) {
      console.error('Error fetching repairs:', error);
      return res.status(500).json({ error: 'Failed to fetch repairs' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
