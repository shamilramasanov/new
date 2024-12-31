import React from 'react';
import Link from 'next/link';
import { formatMoney } from '../../shared/utils/format';
import { getContractTypeColors, getContractTypeName } from '../../utils/contractTypes';

export function ContractsList({ contracts = [], budgetId, kekvCode }) {
  if (!contracts || contracts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Договорів поки немає
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => {
        const { bgColor, textColor } = getContractTypeColors(contract.contractType);

        return (
          <Link 
            key={contract.id} 
            href={`/contracts/${contract.id}?budgetId=${budgetId}&kekvCode=${kekvCode}`}
          >
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {contract.number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {contract.contractor}
                  </p>
                </div>
                <span className={`px-2 py-1 text-sm font-medium rounded-full ${bgColor} ${textColor}`}>
                  {getContractTypeName(contract.contractType)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-500">Код ДК</p>
                  <p className="text-sm font-medium">{contract.dkCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Сума</p>
                  <p className="text-sm font-medium text-blue-600">
                    {formatMoney(contract.amount)} грн
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-700">
                <p className="line-clamp-2">{contract.dkName}</p>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-gray-500">
                  {contract.startDate ? `${new Date(contract.startDate).toLocaleDateString('uk-UA')} -` : ''} 
                  {contract.endDate ? new Date(contract.endDate).toLocaleDateString('uk-UA') : ''}
                </span>
                <span className={
                  contract.status === 'ACTIVE' ? 'text-green-600' : 
                  contract.status === 'PLANNED' ? 'text-blue-600' : 
                  'text-gray-500'
                }>
                  {contract.status === 'ACTIVE' ? 'Активний' : 
                   contract.status === 'PLANNED' ? 'Запланований' : 
                   'Завершений'}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default ContractsList;
