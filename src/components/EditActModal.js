import React, { useState } from 'react';
import { formatCurrency } from '@/utils/format';

export default function EditActModal({ act, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    status: act.status,
    number: act.number || '',
    date: act.date ? new Date(act.date).toISOString().split('T')[0] : '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация при активации
    if (formData.status === 'ACTIVE') {
      if (!formData.number.trim()) {
        alert('Для активації акту необхідно вказати номер');
        return;
      }
      if (!formData.date) {
        alert('Для активації акту необхідно вказати дату');
        return;
      }
    }

    onSubmit(formData);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'На погодженні';
      case 'ACTIVE':
        return 'Активний';
      case 'PAID':
        return 'Оплачено';
      default:
        return status;
    }
  };

  // Определяем, какие статусы доступны для перехода
  const getAvailableStatuses = () => {
    switch (act.status) {
      case 'PENDING':
        return ['PENDING', 'ACTIVE'];
      case 'ACTIVE':
        return ['ACTIVE', 'PAID'];
      case 'PAID':
        return ['PAID'];
      default:
        return [act.status];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Редагування акту</h2>
          <p className="text-sm text-gray-600">
            Сума акту: {formatCurrency(act.totalAmount)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Статус</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                {getAvailableStatuses().map(status => (
                  <option key={status} value={status}>
                    {getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Номер акту</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                disabled={formData.status === 'PENDING' || formData.status === 'PAID'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Дата акту</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                disabled={formData.status === 'PENDING' || formData.status === 'PAID'}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
