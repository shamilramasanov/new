import { prisma } from '../../../lib/prisma';

export default async function handle(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const contracts = await prisma.contract.findMany({
          include: {
            budget: true,
            kekv: true,
            specifications: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // Пересчитываем сумму для каждого договора
        const contractsWithCalculatedAmount = contracts.map(contract => {
          const totalAmount = contract.specifications.reduce((sum, spec) => {
            const amount = spec.price * spec.quantity * (spec.serviceCount || 1);
            return sum + amount;
          }, 0);

          return {
            ...contract,
            amount: totalAmount
          };
        });

        return res.json(contractsWithCalculatedAmount);

      case 'POST':
        console.log('Создание нового договора...');
        const { 
          dkCode, 
          dkName, 
          contractor, 
          budgetId, 
          kekvId,
          specifications 
        } = req.body;

        console.log('Данные договора:', {
          dkCode,
          dkName,
          contractor,
          budgetId,
          kekvId,
          specificationsCount: specifications.length
        });

        // Рассчитываем общую сумму из спецификаций
        const totalAmount = specifications.reduce((sum, spec) => {
          const amount = spec.price * spec.quantity * (spec.serviceCount || 1);
          return sum + amount;
        }, 0);

        // Создаем договор
        const contract = await prisma.$transaction(async (prisma) => {
          console.log('Начало транзакции...');
          
          // Проверяем существование бюджета и КЕКВ
          const budget = await prisma.budget.findUnique({
            where: { id: budgetId },
            include: {
              kekvs: {
                where: { kekvId }
              }
            }
          });

          console.log('Найден бюджет:', budget);

          if (!budget) {
            throw new Error('Не знайдено бюджет');
          }

          const budgetKekv = budget.kekvs[0];
          if (!budgetKekv) {
            throw new Error('Не знайдено КЕКВ в бюджеті');
          }

          // Проверяем доступную сумму
          if (totalAmount > budgetKekv.amount) {
            throw new Error(`Сума договору (${totalAmount.toFixed(2)} грн) перевищує доступну суму в КЕКВ (${budgetKekv.amount.toFixed(2)} грн)`);
          }

          // Получаем КЕКВ для проверки
          const kekv = await prisma.kEKV.findUnique({
            where: { id: kekvId }
          });

          console.log('Найден КЕКВ:', kekv);

          // Создаем категорию "Запчасти" если её нет
          let partsCategory = await prisma.inventoryCategory.findFirst({
            where: { code: '2210-PARTS' }
          });

          if (!partsCategory) {
            console.log('Создаем категорию Запчастини...');
            partsCategory = await prisma.inventoryCategory.create({
              data: {
                name: 'Запчастини',
                code: '2210-PARTS',
                description: 'Автозапчастини за КЕКВ 2210'
              }
            });
          }

          console.log('Категория запчастей:', partsCategory);

          // Создаем единицу измерения "шт" если её нет
          let pcsUnit = await prisma.unit.findFirst({
            where: { code: 'PCS' }
          });

          if (!pcsUnit) {
            console.log('Создаем единицу измерения штука...');
            pcsUnit = await prisma.unit.create({
              data: {
                name: 'штука',
                code: 'PCS'
              }
            });
          }

          console.log('Единица измерения:', pcsUnit);

          // Обновляем сумму в КЕКВ
          await prisma.budgetKekv.update({
            where: { id: budgetKekv.id },
            data: {
              amount: budgetKekv.amount - totalAmount
            }
          });

          console.log('Создаем договор...');
          // Создаем договор
          const newContract = await prisma.contract.create({
            data: {
              status: 'PLANNED',
              dkCode,
              dkName,
              contractor,
              amount: totalAmount,
              budgetId,
              kekvId,
              specifications: {
                create: specifications.map(spec => ({
                  name: spec.name,
                  code: spec.code,
                  unit: spec.unit,
                  quantity: spec.quantity,
                  price: spec.price,
                  serviceCount: spec.serviceCount || 1,
                  type: spec.code ? 'part' : 'service',
                  vehicleBrand: spec.vehicleBrand,
                  vehicleVin: spec.vehicleVin,
                  vehicleLocation: spec.vehicleLocation
                }))
              }
            },
            include: {
              budget: true,
              kekv: true,
              specifications: true
            }
          });

          console.log('Договор создан:', newContract);

          // Создаем или обновляем автомобиль для договора 2240
          if (kekv.code === '2240') {
            console.log('Договор с КЕКВ 2240, проверяем спецификации для создания автомобиля...');
            
            // Получаем уникальные автомобили из спецификаций
            const uniqueVehicles = specifications.reduce((acc, spec) => {
              if (spec.vehicleBrand && spec.vehicleVin && !acc.some(v => v.number === spec.vehicleVin)) {
                acc.push({
                  brand: spec.vehicleBrand.split(' ')[0], // Берем первое слово как бренд
                  model: spec.vehicleBrand.split(' ').slice(1).join(' '), // Остальные слова - модель
                  number: spec.vehicleVin,
                  location: spec.vehicleLocation || 'Основна база'
                });
              }
              return acc;
            }, []);

            // Создаем или обновляем каждый автомобиль
            for (const vehicle of uniqueVehicles) {
              console.log('Обработка автомобиля:', vehicle);
              try {
                // Ищем автомобиль по VIN
                let vehicleRecord = await prisma.vehicle.findUnique({
                  where: { number: vehicle.number }
                });

                if (vehicleRecord) {
                  console.log('Найден существующий автомобиль:', vehicleRecord);
                  // Обновляем только если изменилась локация
                  if (vehicleRecord.location !== vehicle.location) {
                    vehicleRecord = await prisma.vehicle.update({
                      where: { id: vehicleRecord.id },
                      data: { location: vehicle.location }
                    });
                  }
                } else {
                  console.log('Создаем новый автомобиль...');
                  vehicleRecord = await prisma.vehicle.create({
                    data: {
                      brand: vehicle.brand,
                      model: vehicle.model,
                      number: vehicle.number,
                      location: vehicle.location
                    }
                  });
                }

                // Обновляем все спецификации для этого автомобиля
                await prisma.specification.updateMany({
                  where: {
                    contractId: newContract.id,
                    vehicleVin: vehicle.number
                  },
                  data: {
                    vehicleId: vehicleRecord.id
                  }
                });

                console.log('Спецификации обновлены с привязкой к автомобилю:', vehicleRecord.id);
              } catch (error) {
                console.error('Ошибка при создании/обновлении автомобиля:', error);
                throw error;
              }
            }
          }

          // Если это КЕКВ 2210 и секция "Матеріали", создаем товары на складе
          if (kekv.code === '2210') {
            console.log('Договор с КЕКВ 2210, проверяем спецификации...');
            for (const spec of specifications) {
              console.log('Проверяем спецификацию:', {
                name: spec.name,
                code: spec.code,
                section: spec.section,
                quantity: spec.quantity,
                price: spec.price
              });

              if (spec.section === 'Матеріали') {
                console.log('Найдена спецификация с материалами');
                try {
                  // Проверяем существование товара
                  const existingItem = await prisma.inventoryItem.findUnique({
                    where: { code: spec.code }
                  });

                  if (existingItem) {
                    console.log('Обновляем существующий товар:', existingItem);
                    // Обновляем количество существующего товара
                    await prisma.inventoryItem.update({
                      where: { id: existingItem.id },
                      data: {
                        quantity: existingItem.quantity + spec.quantity
                      }
                    });
                  } else {
                    console.log('Создаем новый товар...');
                    const newItem = await prisma.inventoryItem.create({
                      data: {
                        name: spec.name,
                        code: spec.code,
                        description: `${spec.name} (${spec.code})`,
                        quantity: spec.quantity,
                        price: spec.price,
                        categoryId: partsCategory.id,
                        unitId: pcsUnit.id,
                        location: spec.vehicleLocation || 'Основний склад'
                      }
                    });
                    console.log('Создан новый товар:', newItem);
                  }
                } catch (error) {
                  console.error('Ошибка при создании/обновлении товара:', error);
                  throw error;
                }
              } else {
                console.log('Спецификация не является материалом');
              }
            }
          } else {
            console.log('Договор не по КЕКВ 2210:', kekv.code);
          }

          return newContract;
        });

        return res.json(contract);

      default:
        throw new Error(`The HTTP ${req.method} method is not supported at this route.`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
