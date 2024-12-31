import { prisma } from '@/lib/prisma';

export default async function handle(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        const act = await prisma.act.findUnique({
          where: { id },
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

        if (!act) {
          return res.status(404).json({ error: 'Act not found' });
        }

        res.json(act);
        break;

      case 'PATCH':
        const { status, number, date } = req.body;

        // Проверяем корректность перехода статуса
        const currentAct = await prisma.act.findUnique({
          where: { id },
          select: { status: true, number: true, date: true },
        });

        if (!currentAct) {
          return res.status(404).json({ error: 'Act not found' });
        }

        // Валидация перехода статусов
        if (status === 'ACTIVE' && !number) {
          return res.status(400).json({ error: 'Number is required for ACTIVE status' });
        }

        if (status === 'ACTIVE' && !date) {
          return res.status(400).json({ error: 'Date is required for ACTIVE status' });
        }

        // Обновляем акт
        const updatedAct = await prisma.act.update({
          where: { id },
          data: {
            status,
            ...(number && { number }),
            ...(date && { date: new Date(date) }),
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

        // Если статус меняется на ACTIVE, обновляем использованную сумму в договоре
        if (status === 'ACTIVE' && currentAct.status !== 'ACTIVE') {
          await prisma.contract.update({
            where: { id: updatedAct.contractId },
            data: {
              usedAmount: {
                increment: updatedAct.totalAmount
              }
            }
          });
        }

        // Если статус меняется с ACTIVE на PENDING, уменьшаем использованную сумму
        if (status === 'PENDING' && currentAct.status === 'ACTIVE') {
          await prisma.contract.update({
            where: { id: updatedAct.contractId },
            data: {
              usedAmount: {
                decrement: updatedAct.totalAmount
              }
            }
          });
        }

        res.json(updatedAct);
        break;

      case 'DELETE':
        // Получаем информацию об акте перед удалением
        const actToDelete = await prisma.act.findUnique({
          where: { id },
          select: {
            status: true,
            totalAmount: true,
            contractId: true,
          },
        });

        if (!actToDelete) {
          return res.status(404).json({ error: 'Act not found' });
        }

        // Удаляем акт и обновляем сумму в договоре в одной транзакции
        await prisma.$transaction(async (tx) => {
          // Если акт был активным, уменьшаем использованную сумму в договоре
          if (actToDelete.status === 'ACTIVE') {
            await tx.contract.update({
              where: { id: actToDelete.contractId },
              data: {
                usedAmount: {
                  decrement: actToDelete.totalAmount
                }
              }
            });
          }

          // Удаляем акт
          await tx.act.delete({
            where: { id }
          });
        });

        res.status(200).json({ message: 'Act deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
