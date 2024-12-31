import { prisma } from '@/lib/prisma';

export default async function handle(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        const repairs = await prisma.contract.findMany({
          where: {
            vehicleId: id,
          },
          select: {
            id: true,
            number: true,
            contractor: true,
            amount: true,
            startDate: true,
            endDate: true,
            status: true,
            acts: {
              select: {
                id: true,
                number: true,
                date: true,
                status: true,
                totalAmount: true,
              }
            },
            specifications: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
                quantity: true,
                price: true,
                amount: true,
                section: true,
                serviceCount: true,
              }
            }
          },
          orderBy: {
            startDate: 'desc',
          },
        });

        res.json(repairs);
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
