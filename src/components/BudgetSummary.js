// src/components/BudgetSummary.js

import React from 'react';

export default function BudgetSummary({ budgets }) {
  const [selectedBudget, setSelectedBudget] = React.useState('all');
  
  const filteredBudgets = React.useMemo(() => {
    if (selectedBudget === 'all') return budgets;
    return {
      [selectedBudget]: budgets[selectedBudget]
    };
  }, [selectedBudget, budgets]);

  return (
    <div className="space-y-6">
      {/* Фільтр по кошторису */}
      <div className="flex justify-end">
        <select 
          className="border border-gray-300 p-2 rounded shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedBudget}
          onChange={(e) => setSelectedBudget(e.target.value)}
        >
          <option value="all">Всі кошториси</option>
          <option value="main-zf">Основний кошторис ЗФ</option>
          <option value="sf-9">Додатковий кошторис СФ №9</option>
          <option value="sf-32-45">Додатковий кошторис СФ №32; №45</option>
        </select>
      </div>

      {/* Відображення підсумків бюджету */}
      {Object.entries(filteredBudgets).map(([id, budget]) => (
        <div key={id} className="border border-blue-300 rounded-lg p-6 bg-blue-50 shadow">
          <h3 className="text-2xl font-semibold mb-4 text-blue-800">{budget.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['2210', '2240', '3110'].map((kekv) => (
              <div key={kekv} className="border border-blue-200 rounded-lg p-4 bg-white">
                <h4 className="font-semibold mb-2 text-blue-700">КЕКВ {kekv}</h4>
                <div className="space-y-1 text-gray-700">
                  <p>План: <span className="font-medium">{budget.totals[kekv].toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} грн</span></p>
                  <p>Використано: <span className="font-medium">{budget.used[kekv].toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} грн</span></p>
                  <p className={`font-medium ${
                    budget.totals[kekv] - budget.used[kekv] < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    Залишок: { (budget.totals[kekv] - budget.used[kekv]).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } грн
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
