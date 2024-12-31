import { prisma } from '../../../../lib/prisma';

export default async function handle(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        const kekvs = await prisma.kEKV.findMany({
          where: {
            budgets: {
              some: {
                budgetId: id
              }
            }
          },
          orderBy: {
            code: 'asc'
          }
        });
        return res.json(kekvs);

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
