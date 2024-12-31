// Константы для лимитов договоров
export const DIRECT_CONTRACT_LIMIT = 99999.99;

/**
 * Проверяет, превышает ли сумма прямых договоров лимит
 * @param {number} currentAmount - Сумма нового договора
 * @param {Array} existingContracts - Массив существующих договоров в кошторисе
 * @param {string} dkCode - Код ДК для проверки
 * @returns {Object} Результат проверки { isValid: boolean, remainingAmount: number, totalAmount: number }
 */
export const checkDirectContractLimit = (currentAmount, existingContracts, dkCode) => {
  // Фильтруем только прямые договора с тем же ДК кодом
  const relevantContracts = existingContracts.filter(
    contract => contract.contractType === 'Прямий' && contract.dkCode === dkCode
  );

  // Считаем общую сумму существующих договоров
  const existingTotal = relevantContracts.reduce(
    (sum, contract) => sum + parseFloat(contract.amount || 0), 
    0
  );

  // Добавляем сумму нового договора
  const totalAmount = existingTotal + parseFloat(currentAmount || 0);

  // Проверяем, не превышен ли лимит
  const isValid = totalAmount <= DIRECT_CONTRACT_LIMIT;

  // Считаем оставшуюся доступную сумму
  const remainingAmount = Math.max(0, DIRECT_CONTRACT_LIMIT - existingTotal);

  return {
    isValid,
    remainingAmount,
    totalAmount,
    existingTotal
  };
};

/**
 * Форматирует сообщение об ошибке превышения лимита
 * @param {Object} limitCheck - Результат проверки лимита
 * @param {string} dkCode - Код ДК
 * @returns {string} Отформатированное сообщение об ошибке
 */
export const formatLimitErrorMessage = (limitCheck, dkCode) => {
  const { totalAmount, remainingAmount } = limitCheck;
  
  return `Перевищено ліміт для прямих договорів по ДК ${dkCode}.\n` +
    `Поточна сума всіх прямих договорів: ${totalAmount.toFixed(2)} грн\n` +
    `Доступний залишок: ${remainingAmount.toFixed(2)} грн\n` +
    `Максимальна сума для всіх прямих договорів: ${DIRECT_CONTRACT_LIMIT} грн`;
};
