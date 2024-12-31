import React, { useMemo } from 'react';
import { DIRECT_CONTRACT_LIMIT } from '../utils/contractLimits';

const DkLimitInfo = ({ dkCode, dkName, contracts = [], contractType, currentAmount = 0 }) => {
  // Показываем информацию только для прямых договоров
  if (contractType !== 'Прямий' || !dkCode) {
    return null;
  }

  // Фильтруем только активные прямые договора с этим ДК кодом
  const relevantContracts = contracts.filter(
    contract => 
      contract.contractType === 'Прямий' && 
      contract.dkCode === dkCode &&
      contract.status !== 'CANCELLED'
  );

  // Считаем общую сумму существующих договоров
  const existingTotal = relevantContracts.reduce(
    (sum, contract) => sum + parseFloat(contract.amount || 0),
    0
  );

  // Считаем оставшуюся сумму без учета текущего договора
  const remainingAmount = Math.max(0, DIRECT_CONTRACT_LIMIT - existingTotal);

  // Считаем общую сумму с учетом текущего договора
  const currentAmountValue = parseFloat(currentAmount || 0);
  const totalAmount = existingTotal + currentAmountValue;

  // Считаем доступный остаток с учетом текущего договора
  const availableAmount = Math.max(0, DIRECT_CONTRACT_LIMIT - totalAmount);
  
  // Считаем процент использования с учетом текущей суммы
  const usagePercent = (totalAmount / DIRECT_CONTRACT_LIMIT) * 100;

  // Определяем цвет прогресс-бара
  const getProgressColor = (percent) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-2">
        Інформація по ДК {dkCode}
      </h3>
      <p className="text-sm text-gray-600 mb-4">{dkName}</p>

      {/* Прогресс-бар */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
        <div
          className={`h-2.5 rounded-full ${getProgressColor(usagePercent)}`}
          style={{ width: `${Math.min(usagePercent, 100)}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Використано:</p>
          <p className="font-medium text-gray-900">
            {existingTotal.toFixed(2)} грн
          </p>
          {currentAmountValue > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              + {currentAmountValue.toFixed(2)} грн (поточний)
            </p>
          )}
        </div>
        <div>
          <p className="text-gray-600">Доступний залишок:</p>
          <p className="font-medium text-gray-900">
            {availableAmount.toFixed(2)} грн
          </p>
          {currentAmountValue > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              (без поточного: {remainingAmount.toFixed(2)} грн)
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 text-sm">
        <p className="text-gray-600">
          Кількість прямих договорів: {relevantContracts.length}
        </p>
      </div>

      {usagePercent >= 90 && (
        <div className="mt-3 text-sm text-red-600">
          ⚠️ Увага! Ліміт майже вичерпано
        </div>
      )}
    </div>
  );
};

export default DkLimitInfo;
