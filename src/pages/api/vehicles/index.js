import { prisma } from '../../../lib/prisma';

export default async function handle(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        // Получаем все уникальные автомобили из договоров
        const contracts = await prisma.contract.findMany({
          where: {
            kekv: {
              code: '2240'
            },
            vehicleId: {
              not: null
            }
          },
          include: {
            vehicle: true,
            kekv: true,
            specifications: true
          }
        });

        // Группируем договоры по автомобилям
        const vehiclesMap = new Map();
        
        for (const contract of contracts) {
          if (!contract.vehicle) continue;
          
          if (!vehiclesMap.has(contract.vehicle.id)) {
            vehiclesMap.set(contract.vehicle.id, {
              ...contract.vehicle,
              repairs: []
            });
          }
          
          const vehicleData = vehiclesMap.get(contract.vehicle.id);
          vehicleData.repairs.push({
            contractId: contract.id,
            contractNumber: contract.number,
            contractDate: contract.startDate,
            status: contract.status,
            amount: contract.amount,
            specifications: contract.specifications
          });
        }

        // Преобразуем Map в массив
        const vehicles = Array.from(vehiclesMap.values());

        res.json(vehicles);
        break;

      case 'POST':
        const newVehicle = await prisma.vehicle.create({
          data: {
            number: req.body.number,
            brand: req.body.brand,
            model: req.body.model,
            vin: req.body.vin || null,
            year: req.body.year ? parseInt(req.body.year) : null,
            mileage: req.body.mileage ? parseInt(req.body.mileage) : null,
            location: req.body.location || null,
          },
        });
        res.json(newVehicle);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}
