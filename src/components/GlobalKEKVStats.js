import React from 'react';
import { formatMoney } from '../shared/utils/format';

const GlobalKEKVStats = ({ kekvStats = {} }) => {
  // Проверяем, что kekvStats существует и не пустой
  if (!kekvStats || Object.keys(kekvStats).length === 0) {
    return null;
  }

  const sortedKEKV = Object.entries(kekvStats).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedKEKV.map(([code, stats]) => {
        const percent = Math.round((stats.usedTotal / stats.plannedTotal) * 100);
        
        return (
          <div 
            key={code}
            className="bg-white rounded-lg p-4 border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">КЕКВ {code}</h3>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-600">{percent}%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">План</span>
                <span className="text-sm font-medium">{formatMoney(stats.plannedTotal)} грн</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Використано</span>
                <span className="text-sm font-medium text-blue-600">{formatMoney(stats.usedTotal)} грн</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Залишок</span>
                <span className="text-sm font-medium text-red-600">
                  {formatMoney(stats.plannedTotal - stats.usedTotal)} грн
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GlobalKEKVStats;
