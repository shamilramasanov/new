import { prisma } from '../../../lib/prisma';

export default async function handle(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        // Получаем все автомобили с их спецификациями и договорами
        const vehicles = await prisma.vehicle.findMany({
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

        // Преобразуем данные для фронтенда
        const formattedVehicles = vehicles.map(vehicle => {
          // Получаем все спецификации для ремонтов (КЕКВ 2240)
          const repairSpecs = vehicle.specifications.filter(
            spec => spec.contract.kekv.code === '2240' && spec.contract.status !== 'CANCELLED'
          );

          // Группируем спецификации по договорам
          const contractsMap = new Map();
          repairSpecs.forEach(spec => {
            if (!contractsMap.has(spec.contract.id)) {
              contractsMap.set(spec.contract.id, {
                status: spec.contract.status,
                specs: []
              });
            }
            contractsMap.get(spec.contract.id).specs.push(spec);
          });

          // Подсчитываем статистику
          const contracts = Array.from(contractsMap.values());
          const activeRepairs = contracts.filter(c => c.status === 'IN_PROGRESS').length;
          const totalAmount = repairSpecs.reduce((total, spec) => {
            const baseAmount = spec.price * spec.quantity;
            return total + (spec.type === 'service' ? baseAmount * spec.serviceCount : baseAmount);
          }, 0);

          return {
            id: vehicle.id,
            number: vehicle.number,
            brand: vehicle.brand,
            model: vehicle.model,
            vin: vehicle.vin,
            year: vehicle.year,
            mileage: vehicle.mileage,
            location: vehicle.location,
            imageUrl: vehicle.imageUrl,
            repairStats: {
              total: contracts.length,
              active: activeRepairs,
              totalAmount: totalAmount
            }
          };
        });

        res.json(formattedVehicles);
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
