import { prisma } from '@/lib/prisma';

export default async function handle(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const acts = await prisma.act.findMany({
          include: {
            contract: {
              select: {
                number: true,
                contractor: true,
                vehicle: {
                  select: {
                    number: true,
                    brand: true,
                    model: true,
                  },
                },
              },
            },
            actItems: {
              include: {
                specification: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        res.json(acts);
        break;

      case 'POST':
        const { contractId, number, date, items } = req.body;
        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

        // Створюємо акт і оновлюємо договір в одній транзакції
        const newAct = await prisma.$transaction(async (prisma) => {
          // Створюємо акт
          const act = await prisma.act.create({
            data: {
              ...(number && { number }),
              ...(date && { date: new Date(date) }),
              totalAmount,
              contract: {
                connect: { id: contractId }
              },
              actItems: {
                create: items.map(item => ({
                  specificationId: item.specificationId,
                  quantity: item.quantity,
                  serviceCount: item.isService ? item.serviceCount : null,
                  amount: item.amount,
                })),
              },
            },
            include: {
              contract: {
                select: {
                  number: true,
                  contractor: true,
                  vehicle: {
                    select: {
                      number: true,
                      brand: true,
                      model: true,
                    },
                  },
                },
              },
              actItems: {
                include: {
                  specification: true,
                },
              },
            },
          });

          // Оновлюємо використану суму в договорі
          await prisma.contract.update({
            where: { id: contractId },
            data: {
              usedAmount: {
                increment: totalAmount
              }
            }
          });

          return act;
        });

        res.json(newAct);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
