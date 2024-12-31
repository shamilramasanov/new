import React from 'react';
import BudgetManager from '../../components/BudgetManager';
import Link from 'next/link';
import { prisma } from '../../lib/prisma';

export default function Budgets({ budgets }) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex justify-center">
        <Link href="/" passHref legacyBehavior>
          <a className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Повернутися до Аналітики
          </a>
        </Link>
      </div>
      
      <BudgetManager initialBudgets={budgets} />
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        kekv: true,
        contracts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      props: {
        budgets: JSON.parse(JSON.stringify(budgets)), // Сериализуем даты
      },
    };
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return {
      props: {
        budgets: [],
      },
    };
  }
}
