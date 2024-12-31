import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import { prisma } from '../../lib/prisma';
import { formatMoney } from '../../shared/utils/format';
import { ContractsList } from '../../components/contracts/ContractsList';
import GlobalKEKVStats from '../../components/GlobalKEKVStats';
import DkCodeStats from '../../components/DkCodeStats';
import styles from './BudgetPage.module.css';

const getBalanceColor = (totalAmount, usedAmount) => {
  const percentageUsed = (usedAmount / totalAmount) * 100;
  
  if (percentageUsed >= 90) return { color: 'text-red-600 bg-red-50', text: 'Майже витрачено' };
  if (percentageUsed >= 75) return { color: 'text-orange-600 bg-orange-50', text: 'Активно витрачається' };
  if (percentageUsed >= 50) return { color: 'text-yellow-600 bg-yellow-50', text: 'Середній залишок' };
  return { color: 'text-green-600 bg-green-50', text: 'Великий залишок' };
};

const getProgressColor = (percentage) => {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 75) return 'bg-orange-500';
  if (percentage >= 50) return 'bg-yellow-500';
  return 'bg-green-500';
};

export default function BudgetPage({ budget, kekvStats, error }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  if (router.isFallback) {
    return <div>Завантаження...</div>;
  }

  if (!budget) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Кошторис не знайдено</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <p className="text-gray-600 mb-4">
          ID кошторису: {router.query.id}
        </p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Повернутися на головну
        </Link>
      </div>
    );
  }

  // Рассчитываем общую сумму бюджета
  const totalAmount = budget.amount;

  // Рассчитываем использованную сумму
  const usedAmount = budget.contracts
    .filter(contract => ['ACTIVE', 'PLANNED'].includes(contract.status))
    .reduce((sum, contract) => sum + contract.amount, 0);

  // Получаем общее количество договоров
  const totalContracts = budget.contracts.length;

  // Фильтруем контракты
  const filteredContracts = budget.contracts.filter(contract => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    
    return (
      contract.number.toLowerCase().includes(query) ||
      contract.dkCode.toLowerCase().includes(query) ||
      contract.dkName.toLowerCase().includes(query) ||
      contract.contractor.toLowerCase().includes(query) ||
      contract.amount.toString().includes(query)
    );
  });

  const filteredContractsCount = filteredContracts.length;

  // Группируем контракты по КЕКВ
  const contractsByKekv = budget.kekvs.reduce((acc, budgetKekv) => {
    acc[budgetKekv.kekv.code] = {
      code: budgetKekv.kekv.code,
      name: budgetKekv.kekv.name,
      amount: budgetKekv.amount,
      contracts: filteredContracts.filter(contract => contract.kekvId === budgetKekv.kekvId)
    };
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Повернутися на головну
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{budget.name}</h1>
            <p className="text-sm text-gray-500">
              {budget.year} рік
            </p>
          </div>
          <Link 
            href={`/contracts/new?budgetId=${budget.id}`}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Додати договір
          </Link>
        </div>
      </div>

      {/* Основная информация о бюджете */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Загальна інформація</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-blue-900 mb-1">
              Планова сума
            </dt>
            <dd className="text-2xl font-semibold text-blue-700">
              {formatMoney(totalAmount)} грн
            </dd>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-900 mb-1">
              Використано
            </dt>
            <dd className="text-2xl font-semibold text-gray-700">
              {formatMoney(usedAmount)} грн
            </dd>
            <dd className="text-sm text-gray-600 mt-1">
              {((usedAmount / totalAmount) * 100).toFixed(1)}%
            </dd>
          </div>
          <div className={`rounded-lg p-4 ${getBalanceColor(totalAmount, usedAmount).color}`}>
            <dt className="text-sm font-medium mb-1">
              Залишок
            </dt>
            <dd className="text-2xl font-semibold">
              {formatMoney(totalAmount - usedAmount)} грн
            </dd>
            <dd className="text-sm mt-1">
              {((1 - usedAmount / totalAmount) * 100).toFixed(1)}%
            </dd>
          </div>
        </div>
        
        {/* Прогресс-бар */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Прогрес використання</span>
            <span className={getBalanceColor(totalAmount, usedAmount).color}>
              {getBalanceColor(totalAmount, usedAmount).text}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor((usedAmount / totalAmount) * 100)}`}
              style={{ width: `${Math.min((usedAmount / totalAmount) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Статистика КЕКВ */}
      <div className="mb-8">
        <GlobalKEKVStats kekvStats={kekvStats} />
      </div>

      {/* Статистика по ДК кодам */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <DkCodeStats 
            contracts={filteredContracts} 
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* Поиск договоров */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Пошук договорів..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <p className="mt-2 text-sm text-gray-500">
          Знайдено договорів: {filteredContractsCount} з {totalContracts}
        </p>
      </div>

      {/* Список договоров */}
      <div>
        {Object.values(contractsByKekv)
          .filter(kekv => kekv.contracts.length > 0)
          .map((kekv) => (
            <div key={kekv.code} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                КЕКВ {kekv.code} - {kekv.name}
              </h2>
              <div className="text-sm text-gray-500 mb-4">
                Заплановано: {formatMoney(kekv.amount)} грн
              </div>
              <ContractsList 
                contracts={kekv.contracts}
                budgetId={budget.id}
                kekvCode={kekv.code}
              />
            </div>
          ))}
        {filteredContractsCount === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'Договорів за вашим запитом не знайдено' : 'Договорів поки немає'}
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
      include: {
        kekvs: {
          include: {
            kekv: true
          }
        },
        contracts: {
          where: {
            status: {
              in: ['ACTIVE', 'PLANNED']
            }
          }
        }
      }
    });

    if (!budget) {
      return {
        props: {
          error: 'Кошторис не знайдено',
          budget: null,
          kekvStats: {}
        }
      };
    }

    // Подсчитываем статистику КЕКВ для этого бюджета
    const kekvStats = {};
    for (const budgetKekv of budget.kekvs) {
      const contracts = await prisma.contract.findMany({
        where: {
          kekvId: budgetKekv.kekvId,
          status: {
            in: ['ACTIVE', 'PLANNED']
          }
        }
      });

      kekvStats[budgetKekv.kekv.code] = {
        plannedTotal: budgetKekv.amount,
        usedTotal: contracts.reduce((sum, contract) => sum + contract.amount, 0)
      };
    }

    return {
      props: {
        budget: JSON.parse(JSON.stringify(budget)),
        kekvStats,
        error: null
      }
    };
  } catch (error) {
    console.error('Error fetching budget:', error);
    return {
      props: {
        budget: null,
        kekvStats: {},
        error: 'Помилка при завантаженні кошторису'
      }
    };
  }
}
