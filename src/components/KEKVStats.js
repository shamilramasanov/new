import React from 'react';
import { formatMoney } from '../shared/utils/format';

const KEKVStats = ({ kekvStats }) => {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Статистика по КЕКВ</h3>
      <div className="space-y-2">
        {Object.entries(kekvStats).map(([code, stats]) => (
          <div key={code} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">КЕКВ {code}</span>
            <div className="flex items-center space-x-2">
              <div className="text-xs">
                <span className="text-gray-500">План: </span>
                <span className="font-medium">{formatMoney(stats.plannedTotal)}</span>
              </div>
              <div className="text-xs">
                <span className="text-gray-500">Використано: </span>
                <span className="font-medium">{formatMoney(stats.usedTotal)}</span>
              </div>
              <div 
                className={`text-xs font-medium ${
                  (stats.usedTotal / stats.plannedTotal) * 100 >= 90 
                    ? 'text-green-600' 
                    : (stats.usedTotal / stats.plannedTotal) * 100 >= 75 
                    ? 'text-lime-600'
                    : (stats.usedTotal / stats.plannedTotal) * 100 >= 50 
                    ? 'text-orange-600'
                    : 'text-red-600'
                }`}
              >
                {Math.round((stats.usedTotal / stats.plannedTotal) * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KEKVStats;
