import { prisma } from '../../../lib/prisma'

export default async function handle(req, res) {
  const { id } = req.query

  try {
    switch (req.method) {
      case 'GET':
        const budget = await prisma.budget.findUnique({
          where: { id },
          include: {
            kekvs: {
              include: {
                kekv: true
              }
            },
            contracts: true,
          },
        })
        if (!budget) {
          return res.status(404).json({ message: 'Кошторис не знайдено' })
        }
        return res.json(budget)

      case 'PUT':
        const updatedBudget = await prisma.budget.update({
          where: { id },
          data: {
            name: req.body.name,
            type: req.body.type,
            year: parseInt(req.body.year),
            description: req.body.description,
          },
        })
        return res.json(updatedBudget)

      case 'DELETE':
        try {
          // Отримуємо всі договори цього кошторису з їх специфікаціями, автомобілями та товарами зі складу
          const budgetWithRelations = await prisma.budget.findUnique({
            where: { id },
            include: {
              contracts: {
                include: {
                  specifications: {
                    include: {
                      vehicle: true,
                      inventoryItem: true
                    }
                  }
                }
              }
            }
          });

          // Збираємо унікальні ID автомобілів та товарів зі складу
          const vehicleIds = new Set();
          const inventoryItemIds = new Set();
          
          budgetWithRelations.contracts.forEach(contract => {
            contract.specifications.forEach(spec => {
              if (spec.vehicleId) {
                vehicleIds.add(spec.vehicleId);
              }
              if (spec.inventoryItemId) {
                inventoryItemIds.add(spec.inventoryItemId);
              }
            });
          });

          // Видаляємо всі пов'язані автомобілі
          if (vehicleIds.size > 0) {
            await prisma.vehicle.deleteMany({
              where: {
                id: {
                  in: Array.from(vehicleIds)
                }
              }
            });
          }

          // Видаляємо всі пов'язані товари зі складу
          if (inventoryItemIds.size > 0) {
            await prisma.inventoryItem.deleteMany({
              where: {
                id: {
                  in: Array.from(inventoryItemIds)
                }
              }
            });
          }

          // Видаляємо всі зв'язки між бюджетом і КЕКВ
          await prisma.budgetKekv.deleteMany({
            where: { budgetId: id },
          });

          // Видаляємо сам кошторис (це також видалить всі пов'язані договори через onDelete: Cascade)
          const deletedBudget = await prisma.budget.delete({
            where: { id },
          });

          return res.json({ 
            success: true, 
            message: 'Кошторис та пов\'язані дані видалено успішно',
            deletedVehicles: vehicleIds.size,
            deletedInventoryItems: inventoryItemIds.size,
            budget: deletedBudget 
          });
        } catch (error) {
          console.error('Error deleting budget:', error);
          return res.status(500).json({ 
            error: 'Помилка при видаленні кошторису', 
            details: error.message 
          });
        }

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error processing your request' })
  }
}
