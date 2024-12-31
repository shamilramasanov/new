import React from 'react';
import Link from 'next/link';
import { Card } from '../shared/components/ui/Card';
import { formatMoney } from '../shared/utils/format';

const getBalanceColor = (usedAmount, totalAmount) => {
  const percentageUsed = (usedAmount / totalAmount) * 100;
  
  if (percentageUsed >= 90) return { color: 'text-red-600', text: 'Майже витрачено' };
  if (percentageUsed >= 75) return { color: 'text-orange-600', text: 'Активно витрачається' };
  if (percentageUsed >= 50) return { color: 'text-yellow-600', text: 'Середній залишок' };
  return { color: 'text-green-600', text: 'Великий залишок' };
};

const BudgetCard = ({ budget, onDelete }) => {
  // Рассчитываем общую сумму
  const totalAmount = budget.amount;

  // Рассчитываем использованную сумму
  const usedAmount = budget.contracts
    .filter(contract => contract.status === 'ACTIVE')
    .reduce((sum, contract) => sum + contract.amount, 0);

  const usagePercent = (usedAmount / totalAmount) * 100;
  const status = getBalanceColor(usedAmount, totalAmount);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    onDelete();
  };

  return (
    <Link href={`/budgets/${budget.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{budget.name}</h2>
            <p className="text-sm text-gray-500">
              {budget.year} рік
            </p>
          </div>
          <span className={`text-sm font-medium ${status.color}`}>
            {status.text}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Заплановано</span>
            <span className="text-sm font-medium">{formatMoney(totalAmount)} грн</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Використано</span>
            <span className="text-sm font-medium text-blue-600">{formatMoney(usedAmount)} грн</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Залишок</span>
            <span className="text-sm font-medium text-green-600">
              {formatMoney(totalAmount - usedAmount)} грн
            </span>
          </div>
        </div>

        {/* КЕКВ */}
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-900">КЕКВ</h3>
          {budget.kekvs.map((budgetKekv) => (
            <div key={budgetKekv.id} className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{budgetKekv.kekv.code}</span>
              <span className="text-sm font-medium">{formatMoney(budgetKekv.amount)} грн</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center">
          <div className="flex-grow bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-blue-500"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <span className="ml-2 text-sm font-medium text-gray-600">
            {Math.round(usagePercent)}%
          </span>
        </div>

        <button
          onClick={handleDeleteClick}
          className="mt-4 text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          Видалити
        </button>
      </div>
    </Link>
  );
};

export default BudgetCard;
