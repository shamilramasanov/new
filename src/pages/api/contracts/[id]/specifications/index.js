import { prisma } from '../../../../../lib/prisma';

export default async function handle(req, res) {
  const { id } = req.query; // id договора

  try {
    switch (req.method) {
      case 'GET':
        const specifications = await prisma.specification.findMany({
          where: { contractId: id },
          orderBy: [
            { vehicleVin: 'asc' },
            { section: 'asc' },
            { createdAt: 'asc' }
          ],
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
            vehicleBrand: true,
            vehicleVin: true,
            vehicleLocation: true,
            remaining: true,
            createdAt: true,
            updatedAt: true,
            contract: {
              select: {
                id: true,
                number: true,
                dkCode: true,
                dkName: true,
                kekv: true,
                budget: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            inventoryItem: true,
            usageHistory: {
              orderBy: {
                date: 'desc'
              }
            }
          }
        });
        return res.json(specifications);

      case 'POST':
        // Проверяем существование договора
        const contract = await prisma.contract.findUnique({
          where: { id },
          include: { 
            specifications: true,
            budget: true,
            kekv: true
          },
        });

        if (!contract) {
          return res.status(404).json({ error: 'Договір не знайдено' });
        }

        // Получаем данные из запроса
        const { 
          rows,
          name, 
          code, 
          unit, 
          quantity, 
          price, 
          section, 
          serviceCount,
          vehicleBrand,
          vehicleVin,
          vehicleLocation 
        } = req.body;
        const amount = quantity * price * (serviceCount || 1);

        // Проверяем, не превышает ли сумма спецификаций сумму договора
        const currentTotal = contract.specifications.reduce((sum, spec) => sum + spec.amount, 0);
        if (currentTotal + amount > contract.amount) {
          return res.status(400).json({ error: 'Загальна сума специфікацій перевищує суму договору' });
        }

        // Для КЕКВ 2240 проверяем обязательные поля и создаем/связываем автомобиль
        if (contract.kekv.code === '2240') {
          console.log('Processing KEKV 2240 specification:', { vehicleBrand, vehicleVin, vehicleLocation });
          
          if (!vehicleBrand || !vehicleVin || !vehicleLocation) {
            throw new Error('Для КЕКВ 2240 обов\'язково вказати марку, в/н та місце дислокації автомобіля');
          }

          try {
            // Создаем/обновляем автомобиль в отдельной транзакции
            const vehicleResult = await prisma.$transaction(async (tx) => {
              console.log('Looking for existing vehicle with VIN:', vehicleVin);
              
              // Сначала проверяем, есть ли уже автомобиль с таким VIN
              let existingVehicle = await tx.vehicle.findFirst({
                where: { 
                  OR: [
                    { vin: vehicleVin },
                    { number: vehicleVin }
                  ]
                }
              });

              let vehicle;
              if (existingVehicle) {
                // Если автомобиль существует, обновляем его данные
                vehicle = await tx.vehicle.update({
                  where: { id: existingVehicle.id },
                  data: {
                    brand: vehicleBrand,
                    location: vehicleLocation
                  }
                });
              } else {
                // Если автомобиль не существует, создаем новый
                vehicle = await tx.vehicle.create({
                  data: {
                    number: vehicleVin,
                    brand: vehicleBrand,
                    model: 'Не вказано',
                    vin: vehicleVin,
                    location: vehicleLocation
                  }
                });
              }
              
              console.log('Vehicle processed:', vehicle);

              // Связываем автомобиль с договором, если еще не связан или связан с другим автомобилем
              if (!contract.vehicleId || contract.vehicleId !== vehicle.id) {
                console.log('Linking vehicle to contract:', { contractId: id, vehicleId: vehicle.id });
                
                const updatedContract = await tx.contract.update({
                  where: { id },
                  data: {
                    vehicleId: vehicle.id
                  }
                });
                
                console.log('Contract updated with vehicle:', updatedContract);
              }

              return vehicle;
            });

            console.log('Vehicle transaction completed successfully:', vehicleResult);
          } catch (error) {
            console.error('Error processing vehicle:', error);
            throw new Error(`Помилка при обробці автомобіля: ${error.message}`);
          }
        }

        // Преобразуем данные спецификации
        const newSpecifications = rows.map(row => {
          const isService = !row.code; // Если нет кода, считаем что это услуга
          return {
            name: row.name,
            code: row.code || null,
            unit: row.unit,
            quantity: parseFloat(row.quantity),
            price: parseFloat(row.price),
            serviceCount: parseInt(row.serviceCount || 1),
            type: isService ? 'service' : 'part',
            vehicleBrand: row.vehicleBrand,
            vehicleVin: row.vehicleVin,
            vehicleLocation: row.vehicleLocation,
            contractId: id
          };
        });

        // Создаем спецификации в базе данных
        const createdSpecs = await prisma.$transaction(
          newSpecifications.map(spec => 
            prisma.specification.create({
              data: spec,
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
                quantity: true,
                price: true,
                type: true,
                serviceCount: true,
                vehicleBrand: true,
                vehicleVin: true,
                vehicleLocation: true
              }
            })
          )
        );

        return res.json(createdSpecs);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error processing specification:', error);
    return res.status(500).json({ error: error.message || 'Помилка при обробці запиту' });
  }
}
