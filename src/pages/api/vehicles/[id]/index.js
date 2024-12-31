import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
          contracts: {
            include: {
              specifications: true,
              kekv: true
            },
            orderBy: {
              startDate: 'desc'
            }
          }
        }
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      // Преобразуем связанные договоры в формат для отображения
      const formattedVehicle = {
        ...vehicle,
        repairs: vehicle.contracts.map(contract => ({
          id: contract.id,
          contractNumber: contract.number,
          date: contract.startDate,
          endDate: contract.endDate,
          amount: contract.amount,
          status: contract.status,
          specifications: contract.specifications.map(spec => ({
            id: spec.id,
            name: spec.name,
            quantity: spec.quantity,
            price: spec.price,
            amount: spec.amount,
            unit: spec.unit,
            dk: {
              code: spec.dkCode || 'Не вказано',
              name: spec.dkName || 'Не вказано'
            }
          }))
        }))
      };

      // Удаляем contracts из ответа, так как мы уже преобразовали их в repairs
      delete formattedVehicle.contracts;

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
