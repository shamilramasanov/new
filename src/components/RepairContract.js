import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon, PrinterIcon, PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const RepairContract = ({ contract }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA');
  };

  const formatMoney = (amount) => {
    return Number(amount).toLocaleString('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'В роботі':
        return 'bg-yellow-500';
      case 'Завершено':
        return 'bg-green-500';
      case 'Скасовано':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      {/* Заголовок договора (всегда виден) */}
      <div
        className="bg-white p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            )}
            <span className="font-medium">Договір №{contract.number}</span>
            <span className="text-gray-600">{formatMoney(contract.amount)} грн</span>
            <span className="text-gray-500">від {formatDate(contract.date)}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)} text-white`}>
              {contract.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="p-2 text-gray-400 hover:text-gray-500"
              onClick={(e) => {
                e.stopPropagation();
                // Добавить функцию печати
              }}
              title="Друкувати"
            >
              <PrinterIcon className="h-5 w-5" />
            </button>
            <Link
              href={`/contracts/${contract.id}/edit`}
              className="p-2 text-gray-400 hover:text-gray-500"
              onClick={(e) => e.stopPropagation()}
              title="Редагувати"
            >
              <PencilIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Детали договора (видны только при развернутом состоянии) */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Роботи та запчастини:</h4>
              <ul className="space-y-2">
                {contract.items?.map((item, index) => (
                  <li key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="text-gray-900">{formatMoney(item.amount)} грн</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <Link
                href={`/contracts/${contract.id}/edit`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Редагувати
              </Link>
              <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Друк
              </button>
              {contract.status === 'В роботі' && (
                <button
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  Закрити договір
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairContract;
