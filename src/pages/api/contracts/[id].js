import { prisma } from '../../../lib/prisma';

// Функция для обработки данных контракта
function processContractData(contract) {
  // Подсчитываем остатки по спецификациям
  const specifications = contract.specifications.map(spec => {
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

  return {
    ...contract,
    specifications,
    usedAmount,
    remainingAmount: contract.amount - usedAmount
  };
}

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
                type: true,
                serviceCount: true,
                vehicleBrand: true,
                vehicleVin: true,
                vehicleLocation: true,
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

        res.json(processContractData(contract));
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
            specifications: {
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
                vehicleLocation: true,
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
            }
          }
        });

        return res.json(processContractData(updatedStatusContract));

      case 'DELETE':
        try {
          // Получаем информацию о договоре перед удалением
          const contractToDelete = await prisma.contract.findUnique({
            where: { id },
            include: {
              vehicle: true,
              specifications: true
            }
          });

          if (!contractToDelete) {
            return res.status(404).json({ error: 'Contract not found' });
          }

          // Удаляем договор (спецификации удалятся каскадно)
          await prisma.contract.delete({
            where: { id }
          });

          // Если у договора было транспортное средство
          if (contractToDelete.vehicle) {
            // Проверяем, есть ли другие договоры с этим транспортным средством
            const otherContracts = await prisma.contract.count({
              where: {
                vehicleId: contractToDelete.vehicle.id,
                NOT: {
                  id: contractToDelete.id
                }
              }
            });

            // Если это было единственное использование транспортного средства, удаляем его
            if (otherContracts === 0) {
              await prisma.vehicle.delete({
                where: {
                  id: contractToDelete.vehicle.id
                }
              });
            }
          }

          return res.json({ success: true });
        } catch (error) {
          console.error('Error deleting contract:', error);
          return res.status(500).json({ error: 'Failed to delete contract' });
        }

      default:
        throw new Error(`The HTTP ${req.method} method is not supported at this route.`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
