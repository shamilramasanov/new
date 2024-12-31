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
          status: true,
          contractType: true,
          specifications: {
            select: {
              id: true,
              name: true,
              code: true,
              unit: true,
              quantity: true,
              price: true,
              serviceCount: true,
              type: true
            }
          }
        }
      });

      // Вычисляем суммы для каждого договора
      const contractsWithAmounts = contracts.map(contract => {
        const amount = contract.specifications.reduce((sum, spec) => {
          const baseAmount = spec.price * spec.quantity;
          return sum + (spec.type === 'service' ? baseAmount * spec.serviceCount : baseAmount);
        }, 0);

        return {
          ...contract,
          amount,
          specifications: contract.specifications.map(spec => ({
            ...spec,
            amount: spec.price * spec.quantity * (spec.type === 'service' ? spec.serviceCount : 1)
          }))
        };
      });

      // Группируем договоры по ДК коду для подсчета общей суммы
      const contractsByDk = contractsWithAmounts.reduce((acc, contract) => {
        if (!acc[contract.dkCode]) {
          acc[contract.dkCode] = {
            total: 0,
            directTotal: 0,
            contracts: []
          };
        }
        
        acc[contract.dkCode].total += contract.amount;
        if (contract.contractType === 'Прямий') {
          acc[contract.dkCode].directTotal += contract.amount;
        }
        acc[contract.dkCode].contracts.push(contract);
        
        return acc;
      }, {});

      return res.json(contractsWithAmounts);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Error processing request' });
  }
}
