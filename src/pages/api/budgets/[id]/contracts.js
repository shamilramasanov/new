import { prisma } from '../../../../lib/prisma';
import { getOrCreateTestUser } from '../../../../middleware/auth';

export default async function handle(req, res) {
  try {
    const { id } = req.query;

    // GET /api/budgets/[id]/contracts
    if (req.method === 'GET') {
      const contracts = await prisma.contract.findMany({
        where: {
          budgetId: id,
          // Добавляем фильтр по активным договорам
          status: {
            not: 'CANCELLED'
          }
        },
        select: {
          id: true,
          number: true,
          dkCode: true,
          amount: true,
          status: true,
          contractType: true,
          specifications: {
            select: {
              id: true,
              amount: true
            }
          }
        }
      });

      // Группируем договоры по ДК коду для подсчета общей суммы
      const contractsByDk = contracts.reduce((acc, contract) => {
        if (!acc[contract.dkCode]) {
          acc[contract.dkCode] = {
            total: 0,
            directTotal: 0,
            contracts: []
          };
        }
        
        const amount = parseFloat(contract.amount || 0);
        acc[contract.dkCode].total += amount;
        if (contract.contractType === 'Прямий') {
          acc[contract.dkCode].directTotal += amount;
        }
        acc[contract.dkCode].contracts.push(contract);
        
        return acc;
      }, {});

      return res.json(contracts);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Error processing request' });
  }
}
