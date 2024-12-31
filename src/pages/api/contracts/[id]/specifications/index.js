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
              
              // Ищем существующий автомобиль по VIN или создаем новый
              const vehicle = await tx.vehicle.upsert({
                where: { vin: vehicleVin },
                update: {
                  brand: vehicleBrand,
                  location: vehicleLocation
                },
                create: {
                  number: vehicleVin, // Используем VIN как номер, если нет бортового
                  brand: vehicleBrand,
                  model: 'Не вказано',
                  vin: vehicleVin,
                  location: vehicleLocation
                }
              });
              
              console.log('Vehicle upserted:', vehicle);

              // Связываем автомобиль с договором, если еще не связан
              if (!contract.vehicleId) {
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

        // Создаем спецификацию и инвентарь (если не 2240)
        const result = await prisma.$transaction(async (prisma) => {
          let inventoryItemId = null;

          // Создаем запись в инвентаре только если это НЕ 2240
          if (contract.kekv.code !== '2240' && code) {
            // Находим или создаем категорию инвентаря на основе КЕКВ
            const category = await prisma.inventoryCategory.upsert({
              where: { code: contract.kekv.code },
              update: {},
              create: {
                name: contract.kekv.name,
                code: contract.kekv.code,
                description: `Категорія створена автоматично на основі КЕКВ ${contract.kekv.code}`
              }
            });

            const inventoryItem = await prisma.inventoryItem.create({
              data: {
                name,
                code: `${contract.number}-${code}`, // Уникальный код для инвентаря
                unit,
                quantity,
                price,
                totalCost: amount,
                description: `Поставка за договором ${contract.number}`,
                category: {
                  connect: {
                    id: category.id
                  }
                },
                contract: {
                  connect: {
                    id
                  }
                }
              }
            });
            inventoryItemId = inventoryItem.id;
          }

          // Создаем спецификацию
          const specification = await prisma.specification.create({
            data: {
              name,
              code,
              unit,
              quantity,
              price,
              amount,
              section: code ? 'Запчастини' : 'Послуги',
              serviceCount,
              vehicleBrand: vehicleBrand || 'Не вказано',
              vehicleVin: vehicleVin || 'Не вказано',
              vehicleLocation: vehicleLocation || 'Не вказано',
              contractId: id,
              // Связываем с инвентарем только если он был создан
              ...(inventoryItemId && {
                inventoryItem: {
                  connect: {
                    id: inventoryItemId
                  }
                }
              })
            },
            include: {
              contract: {
                select: {
                  dkCode: true,
                  dkName: true,
                  budget: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              },
              inventoryItem: true
            }
          });

          return specification;
        });

        return res.json(result);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error processing specification:', error);
    return res.status(500).json({ error: error.message || 'Помилка при обробці запиту' });
  }
}
