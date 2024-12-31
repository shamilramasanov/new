import React, { useState } from 'react';
import { DIRECT_CONTRACT_LIMIT } from '../utils/contractLimits';
import { formatMoney } from '../shared/utils/format';

// Вспомогательная функция для группировки договоров по ДК коду
const groupContractsByDkCode = (contracts) => {
  return contracts.reduce((acc, contract) => {
    if (!contract.dkCode) return acc;

    if (!acc[contract.dkCode]) {
      acc[contract.dkCode] = {
        dkCode: contract.dkCode,
        dkName: contract.dkName,
        totalAmount: 0,
        directAmount: 0,
        contracts: []
      };
    }

    const amount = parseFloat(contract.amount) || 0;
    acc[contract.dkCode].totalAmount += amount;
    if (contract.contractType === 'DIRECT' && ['ACTIVE', 'PLANNED'].includes(contract.status)) {
      acc[contract.dkCode].directAmount += amount;
    }
    acc[contract.dkCode].contracts.push(contract);

    return acc;
  }, {});
};

// Функция для проверки, является ли ДК код услугой
const isServiceDkCode = (dkCode) => {
  if (!dkCode) return false;
  return dkCode.startsWith('501');
};

const getBalanceColor = (usedAmount, totalAmount) => {
  const percentageUsed = (usedAmount / totalAmount) * 100;
  
  if (percentageUsed >= 90) return { color: 'text-green-600 bg-green-50', text: 'Майже витрачено' };
  if (percentageUsed >= 75) return { color: 'text-lime-600 bg-lime-50', text: 'Добре витрачається' };
  if (percentageUsed >= 50) return { color: 'text-orange-600 bg-orange-50', text: 'Середній залишок' };
  return { color: 'text-red-600 bg-red-50', text: 'Великий залишок' };
};

const getProgressColor = (percentage) => {
  if (percentage >= 90) return 'bg-green-500';
  if (percentage >= 75) return 'bg-lime-500';
  if (percentage >= 50) return 'bg-orange-500';
  return 'bg-red-500';
};

const DkCodeStats = ({ contracts = [], searchQuery = '' }) => {
  // Проверяем, что contracts существует и является массивом
  if (!Array.isArray(contracts)) {
    console.warn('DkCodeStats: contracts is not an array', contracts);
    return null;
  }

  const [sortBy, setSortBy] = useState('dkCode'); // 'dkCode', 'totalAmount', 'remaining'

  // Группируем договора по ДК кодам
  const groupedContracts = groupContractsByDkCode(contracts);

  // Фильтруем и сортируем группы
  const filteredGroups = Object.values(groupedContracts)
    .filter(group => 
      group.dkCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.dkName && group.dkName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'totalAmount':
          return b.totalAmount - a.totalAmount;
        case 'remaining':
          const remainingA = isServiceDkCode(a.dkCode) ? 0 : DIRECT_CONTRACT_LIMIT - a.directAmount;
          const remainingB = isServiceDkCode(b.dkCode) ? 0 : DIRECT_CONTRACT_LIMIT - b.directAmount;
          return remainingB - remainingA;
        default:
          return a.dkCode.localeCompare(b.dkCode);
      }
    });

  return (
    <div className="space-y-6">
      {/* Заголовок и сортировка */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Статистика за ДК кодами
        </h3>
        <select
          className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="dkCode">За ДК кодом</option>
          <option value="totalAmount">За сумою</option>
          <option value="remaining">За залишком</option>
        </select>
      </div>

      {/* Список ДК кодов */}
      <div className="grid gap-4">
        {filteredGroups.map((group) => {
          const isService = isServiceDkCode(group.dkCode);
          const remainingAmount = isService ? 0 : DIRECT_CONTRACT_LIMIT - group.directAmount;
          const usagePercent = isService ? 0 : (group.directAmount / DIRECT_CONTRACT_LIMIT) * 100;
          const status = getBalanceColor(group.directAmount, isService ? group.totalAmount : DIRECT_CONTRACT_LIMIT);

          return (
            <div
              key={group.dkCode}
              className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Заголовок группы */}
              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-900">
                  {group.dkCode} - {group.dkName}
                  {isService && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Послуга
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-500">
                  Всього договорів: {group.contracts.length}
                </p>
              </div>

              {/* Суммы */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">Загальна сума:</p>
                  <p className="font-medium text-gray-900">
                    {formatMoney(group.totalAmount)}
                  </p>
                </div>
                {!isService && (
                  <div>
                    <p className="text-sm text-gray-600">Сума прямих:</p>
                    <p className="font-medium text-gray-900">
                      {formatMoney(group.directAmount)}
                    </p>
                  </div>
                )}
              </div>

              {/* Прогресс-бар для прямих договорів (только для не-услуг) */}
              {!isService && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Ліміт прямих договорів</span>
                    <span>{usagePercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getProgressColor(usagePercent)}`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Можна ще укласти: {formatMoney(remainingAmount)}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-sm ${status.color}`}>
                    {status.text}
                  </span>
                </div>
              )}

              {/* Предупреждение */}
              {!isService && remainingAmount <= 10000 && (
                <div className="mt-2 text-sm text-red-600">
                  ⚠️ Увага! Залишок для прямих договорів менше 10,000 грн
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            {searchQuery
              ? 'Немає ДК кодів, що відповідають пошуку'
              : 'Немає договорів для відображення'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DkCodeStats;
