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
          // Сначала удаляем все связи между бюджетом и КЕКВ
          await prisma.budgetKekv.deleteMany({
            where: { budgetId: id },
          })

          // Затем удаляем сам кошторис
          const deletedBudget = await prisma.budget.delete({
            where: { id },
          })

          return res.json(deletedBudget)
        } catch (error) {
          console.error('Error deleting budget:', error)
          return res.status(500).json({ error: 'Error deleting budget' })
        }

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error processing your request' })
  }
}
