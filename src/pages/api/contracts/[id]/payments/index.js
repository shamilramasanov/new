import { prisma } from '../../../../../lib/prisma';

export default async function handle(req, res) {
  const { id: contractId } = req.query;

  if (req.method === 'POST') {
    try {
      const { amount, date, description } = req.body;

      // Получаем информацию о договоре и существующих платежах
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: {
          payments: true,
          kekv: true,
          budget: true,
        },
      });

      if (!contract) {
        return res.status(404).json({ message: 'Договір не знайдено' });
      }

      // Проверяем, не превышает ли сумма платежей сумму договора
      const totalPaid = contract.payments.reduce((sum, payment) => sum + payment.amount, 0);
      if (totalPaid + amount > contract.amount) {
        return res.status(400).json({
          message: `Сума платежів не може перевищувати суму договору. Максимальна сума платежу: ${contract.amount - totalPaid}`
        });
      }

      // Создаем платеж в транзакции
      const payment = await prisma.$transaction(async (prisma) => {
        // Создаем платеж
        const newPayment = await prisma.payment.create({
          data: {
            amount: parseFloat(amount),
            date: new Date(date),
            description,
            contract: { connect: { id: contractId } },
          },
        });

        // Если это последний платеж (сумма платежей равна сумме договора)
        if (totalPaid + amount === contract.amount) {
          // Обновляем статус договора на COMPLETED
          await prisma.contract.update({
            where: { id: contractId },
            data: { status: 'COMPLETED' },
          });
        }

        return newPayment;
      });

      res.json(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({
        message: 'Помилка при створенні платежу',
        error: error.message,
      });
    }
  } else if (req.method === 'GET') {
    try {
      // Получаем все платежи по договору с информацией о договоре
      const payments = await prisma.payment.findMany({
        where: { contractId },
        include: {
          contract: {
            include: {
              budget: true,
              kekv: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      });

      // Подсчитываем общую сумму платежей
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

      res.json({
        payments,
        totalPaid,
        remainingAmount: payments[0]?.contract.amount - totalPaid || 0,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({
        message: 'Помилка при отриманні платежів',
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
