import { prisma } from '../../../lib/prisma'
import { getOrCreateTestUser } from '../../../middleware/auth'

export default async function handle(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const budgets = await prisma.budget.findMany({
          include: {
            kekvs: {
              include: {
                kekv: true
              }
            },
            contracts: true,
          },
        })
        return res.json(budgets)

      case 'POST':
        try {
          const { name, type, date, description, kekv } = req.body;
          
          // Получаем или создаем тестового пользователя
          const user = await getOrCreateTestUser();
          
          // Получаем год из даты
          const budgetDate = new Date(date);
          const year = budgetDate.getFullYear();
          
          // Функция для получения названия КЕКВ
          const getKekvName = (code) => {
            switch (code) {
              case '2210':
                return 'Предмети, матеріали, обладнання та інвентар';
              case '2240':
                return 'Оплата послуг (крім комунальних)';
              case '3110':
                return 'Придбання обладнання і предметів довгострокового користування';
              default:
                return '';
            }
          };
          
          // Вычисляем общую сумму бюджета
          const totalAmount = kekv.reduce((sum, item) => sum + parseFloat(item.plannedAmount), 0);
          
          // Создаем бюджет
          const budget = await prisma.budget.create({
            data: {
              name,
              type,
              year,
              date: budgetDate,
              description: description || '',
              amount: totalAmount,
              user: {
                connect: { id: user.id }
              }
            }
          });

          // Создаем или получаем КЕКВ и связываем их с бюджетом
          for (const item of kekv) {
            // Находим или создаем КЕКВ
            let kekvRecord = await prisma.kEKV.findFirst({
              where: { code: item.code }
            });

            if (!kekvRecord) {
              kekvRecord = await prisma.kEKV.create({
                data: {
                  code: item.code,
                  name: getKekvName(item.code)
                }
              });
            }

            // Создаем связь между бюджетом и КЕКВ
            await prisma.budgetKekv.create({
              data: {
                budgetId: budget.id,
                kekvId: kekvRecord.id,
                amount: parseFloat(item.plannedAmount)
              }
            });
          }

          // Получаем обновленный бюджет со всеми связями
          const updatedBudget = await prisma.budget.findUnique({
            where: { id: budget.id },
            include: {
              kekvs: {
                include: {
                  kekv: true
                }
              }
            }
          });

          return res.json(updatedBudget);
        } catch (error) {
          console.error('Error creating budget:', error)
          return res.status(500).json({ error: 'Error processing your request' })
        }

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error processing your request' })
  }
}
