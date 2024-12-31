import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      console.log('Fetching repairs for vehicle:', id);
      
      // Получаем все договоры для автомобиля
      const contracts = await prisma.contract.findMany({
        where: {
          vehicleId: id
        },
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
          },
          specifications: {
            where: {
              vehicleId: id // Фильтруем спецификации только для этого автомобиля
            }
          }
        },
        orderBy: {
          startDate: 'desc'
        }
      });

      console.log('Found contracts:', contracts.length);

      // Фильтруем договоры, оставляя только те, у которых есть спецификации для данного авто
      const contractsWithSpecs = contracts.filter(contract => contract.specifications.length > 0);

      // Преобразуем договоры в нужный формат
      const repairsWithTotals = contractsWithSpecs.map(contract => ({
        id: contract.id,
        number: contract.number,
        contractor: contract.contractor,
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: contract.status,
        kekv: {
          code: contract.kekv.code,
          name: contract.kekv.name
        },
        acts: contract.acts,
        specifications: contract.specifications.map(spec => ({
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
        })),
        amount: contract.specifications.reduce((sum, spec) => 
          sum + (spec.price * spec.quantity * (spec.type === 'service' ? spec.serviceCount : 1)), 0)
      }));

      console.log('Processed repairs data successfully');
      return res.json(repairsWithTotals);
    } catch (error) {
      console.error('Error fetching repairs:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta
      });
      return res.status(500).json({ 
        error: 'Failed to fetch repairs',
        details: error.message
      });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
