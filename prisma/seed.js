const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Очищаем базу данных
    await prisma.specification.deleteMany()
    await prisma.contract.deleteMany()
    await prisma.budgetKekv.deleteMany()
    await prisma.budget.deleteMany()
    await prisma.kEKV.deleteMany()
    await prisma.user.deleteMany()

    // Создаем тестового пользователя
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      }
    })

    // Создаем КЕКВ
    const kekv2240 = await prisma.kEKV.create({
      data: {
        code: '2240',
        name: 'Оплата послуг (крім комунальних)',
      }
    })

    // Создаем бюджет
    const budget = await prisma.budget.create({
      data: {
        name: 'Кошторис 2024',
        type: 'Загальний фонд',
        year: 2024,
        date: new Date(),
        description: 'Тестовий кошторис',
        amount: 1000000,
        userId: user.id,
        kekvs: {
          create: [
            {
              kekvId: kekv2240.id,
              amount: 500000,
            }
          ]
        }
      }
    })

    // Создаем договор
    const contract = await prisma.contract.create({
      data: {
        status: 'PLANNED',
        contractor: 'ТОВ "Тестова компанія"',
        amount: 100000,
        dkCode: '50110000-9',
        dkName: 'Послуги з ремонту і технічного обслуговування транспортних засобів',
        budgetId: budget.id,
        kekvId: kekv2240.id,
        specifications: {
          create: [
            {
              name: 'Технічне обслуговування автомобіля',
              code: '50112000-3',
              unit: 'послуга',
              quantity: 1,
              price: 100000,
              amount: 100000,
              section: 'Послуги',
              vehicleBrand: 'Toyota Camry',
              vehicleVin: 'ABC123456789',
              vehicleLocation: 'м. Київ'
            }
          ]
        }
      }
    })

    console.log('Тестові дані створено')
  } catch (error) {
    console.error('Помилка при створенні тестових даних:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
