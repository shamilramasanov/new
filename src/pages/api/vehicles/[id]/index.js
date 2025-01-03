import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
          specifications: {
            include: {
              contract: {
                include: {
                  kekv: true
                }
              }
            }
          }
        }
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      // Группируем договоры по их ID
      const contractsMap = new Map();
      
      // Собираем все уникальные договоры из спецификаций
      vehicle.specifications.forEach(spec => {
        if (spec.contract && !contractsMap.has(spec.contract.id)) {
          contractsMap.set(spec.contract.id, {
            ...spec.contract,
            specifications: []
          });
        }
        if (spec.contract) {
          contractsMap.get(spec.contract.id).specifications.push(spec);
        }
      });

      // Преобразуем связанные договоры в формат для отображения
      const formattedVehicle = {
        ...vehicle,
        repairs: Array.from(contractsMap.values()).map(contract => {
          // Фильтруем спецификации только для текущего автомобиля
          const vehicleSpecs = contract.specifications.filter(spec => spec.vehicleId === vehicle.id);
          
          // Считаем сумму только для спецификаций этого автомобиля
          const vehicleAmount = vehicleSpecs.reduce((sum, spec) => {
            const specAmount = spec.price * spec.quantity * (spec.type === 'service' ? spec.serviceCount : 1);
            return sum + specAmount;
          }, 0);

          return {
            id: contract.id,
            contractNumber: contract.number,
            date: contract.startDate,
            endDate: contract.endDate,
            amount: vehicleAmount,
            status: contract.status,
            contractor: contract.contractor,
            specifications: vehicleSpecs.map(spec => ({
              id: spec.id,
              name: spec.name,
              quantity: spec.quantity,
              price: spec.price,
              amount: spec.price * spec.quantity * (spec.type === 'service' ? spec.serviceCount : 1),
              unit: spec.unit,
              type: spec.type,
              serviceCount: spec.serviceCount
            }))
          };
        }).filter(contract => contract.specifications.length > 0) // Убираем договоры без спецификаций для этого автомобиля
      };

      res.status(200).json(formattedVehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      res.status(500).json({ error: 'Failed to fetch vehicle' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
