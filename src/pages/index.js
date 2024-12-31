import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '../shared/components/ui/Card';
import { formatMoney } from '../shared/utils/format';
import { prisma } from '../lib/prisma';
import styles from './HomePage.module.css';
import BudgetCard from '../components/BudgetCard';
import GlobalKEKVStats from '../components/GlobalKEKVStats';

export default function HomePage({ budgets, kekvStats }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Загальний фонд',
    date: new Date().toISOString().split('T')[0],
    kekv: [{ code: '2210', plannedAmount: '' }]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Failed to create budget');
      
      window.location.reload();
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Помилка при створенні кошторису');
    }
  };

  const deleteBudget = async (id) => {
    if (!confirm('Ви впевнені, що хочете видалити цей кошторис?')) return;
    
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete budget');
      
      window.location.reload();
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Помилка при видаленні кошторису');
    }
  };

  const addKekv = () => {
    setFormData({
      ...formData,
      kekv: [...formData.kekv, { code: '2210', plannedAmount: '' }]
    });
  };

  const removeKekv = (index) => {
    setFormData({
      ...formData,
      kekv: formData.kekv.filter((_, i) => i !== index)
    });
  };

  const updateKekv = (index, field, value) => {
    const newKekv = [...formData.kekv];
    newKekv[index] = { ...newKekv[index], [field]: value };
    setFormData({ ...formData, kekv: newKekv });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Верхняя панель */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бюджетний менеджер</h1>
          <p className="text-sm text-gray-500">Керуйте вашими кошторисами ефективно</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          + Створити кошторис
        </button>
      </div>

      {/* Статистика КЕКВ */}
      <div className="mb-8">
        <GlobalKEKVStats kekvStats={kekvStats} />
      </div>

      {/* Карточки бюджетов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            onDelete={() => deleteBudget(budget.id)}
          />
        ))}
      </div>

      {/* Модальное окно создания бюджета */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Створення кошторису</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Назва кошторису
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Тип кошторису
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option>Загальний фонд</option>
                  <option>Спеціальний фонд</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Дата
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  КЕКВ
                </label>
                {formData.kekv.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={item.code}
                      onChange={(e) => updateKekv(index, 'code', e.target.value)}
                      className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="2210">2210</option>
                      <option value="2240">2240</option>
                      <option value="3110">3110</option>
                    </select>
                    <input
                      type="number"
                      value={item.plannedAmount}
                      onChange={(e) => updateKekv(index, 'plannedAmount', e.target.value)}
                      placeholder="Сума"
                      className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    {formData.kekv.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKekv(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addKekv}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  + Додати КЕКВ
                </button>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Створити
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  try {
    // Получаем бюджеты
    const budgets = await prisma.budget.findMany({
      include: {
        kekvs: {
          include: {
            kekv: true
          }
        },
        contracts: true
      },
    });

    // Получаем статистику по КЕКВ
    const kekvs = await prisma.kEKV.findMany();

    // Группируем данные по кодам КЕКВ
    const kekvStats = {};
    for (const kekv of kekvs) {
      const budgetKekvs = await prisma.budgetKekv.findMany({
        where: {
          kekvId: kekv.id
        }
      });

      const contracts = await prisma.contract.findMany({
        where: {
          kekvId: kekv.id,
          status: {
            in: ['ACTIVE', 'PLANNED']
          }
        }
      });

      kekvStats[kekv.code] = {
        plannedTotal: budgetKekvs.reduce((sum, bk) => sum + bk.amount, 0),
        usedTotal: contracts.reduce((sum, contract) => sum + contract.amount, 0),
      };
    }

    return {
      props: {
        budgets: JSON.parse(JSON.stringify(budgets)),
        kekvStats,
      },
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      props: {
        budgets: [],
        kekvStats: {},
      },
    };
  }
}
