import { prisma } from '../../../src/lib/prisma';

export default async function handle(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Очищаем базу данных
    await prisma.payment.deleteMany();
    await prisma.specification.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.kEKV.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.user.deleteMany();

    // Создаем тестового пользователя
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    // Создаем базовый кошторис
    const budget = await prisma.budget.create({
      data: {
        name: 'Основний кошторис',
        type: 'Загальний фонд',
        year: new Date().getFullYear(),
        date: new Date(),
        description: 'Основний кошторис на поточний рік',
        totalAmount: 1000000,
        usedAmount: 0,
        userId: user.id,
      },
    });

    // Создаем основные КЕКВ
    const kekvList = [
      { code: '2210', name: 'Предмети, матеріали, обладнання та інвентар', plannedAmount: 500000 },
      { code: '2240', name: 'Оплата послуг (крім комунальних)', plannedAmount: 300000 },
      { code: '2250', name: 'Видатки на відрядження', plannedAmount: 200000 },
    ];

    for (const kekvData of kekvList) {
      await prisma.kEKV.create({
        data: {
          ...kekvData,
          usedAmount: 0,
          budgetId: budget.id,
        },
      });
    }

    res.json({ message: 'База даних успішно оновлена' });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ error: error.message });
  }
}
