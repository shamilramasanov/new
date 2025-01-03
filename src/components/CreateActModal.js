import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';

export default function CreateActModal({ contract, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    number: '',
    date: '',
    items: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (contract?.specifications) {
      // Группируем спецификации по имени и типу
      const groupedSpecs = contract.specifications.reduce((acc, spec) => {
        const key = `${spec.name}_${spec.type}`;
        if (!acc[key]) {
          acc[key] = spec;
        }
        return acc;
      }, {});

      // Создаем items из уникальных спецификаций
      const items = Object.values(groupedSpecs).map(spec => ({
        specificationId: spec.id,
        name: spec.name,
        code: spec.code,
        unit: spec.unit,
        price: spec.price,
        maxQuantity: spec.quantity, // Максимальное количество из спецификации
        quantity: 0,
        amount: 0,
        isService: spec.type === 'service',
        serviceCount: spec.serviceCount,
        selected: false
      }));
      
      setFormData(prev => ({ ...prev, items }));
      setLoading(false);
    }
  }, [contract]);

  const calculateAmount = (item, quantity) => {
    if (item.isService) {
      // Для работ: количество (норма часов) * цена
      return quantity * item.price;
    } else {
      // Для запчастей: количество * цена
      return quantity * item.price;
    }
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const item = newItems[index];

      if (field === 'selected') {
        item.selected = value;
        if (!value) {
          // Если снимаем выделение, сбрасываем количество
          item.quantity = 0;
          item.amount = 0;
        } else {
          // При выборе позиции устанавливаем количество
          if (item.isService) {
            // Для работ устанавливаем норму часов из спецификации
            item.quantity = item.maxQuantity;
          } else {
            // Для запчастей устанавливаем количество 1
            item.quantity = 1;
          }
          item.amount = calculateAmount(item, item.quantity);
        }
      } else if (field === 'quantity') {
        // Ограничиваем количество максимальным доступным
        const newQuantity = Math.min(Math.max(0, value), item.maxQuantity);
        item.quantity = newQuantity;
        item.amount = calculateAmount(item, newQuantity);
      }

      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedItems = formData.items.filter(item => item.selected && item.quantity > 0);
    if (selectedItems.length === 0) {
      alert('Виберіть хоча б одну позицію');
      return;
    }

    const submitData = {
      ...formData,
      contractId: contract.id, // Додаємо ID договору
      items: selectedItems,
    };

    onSubmit(submitData);
  };

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;

  const services = formData.items.filter(item => item.isService);
  const parts = formData.items.filter(item => !item.isService);
  const totalAmount = formData.items
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Створення акту виконаних робіт</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Таблиця робіт */}
            {services.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Роботи</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2"></th>
                      <th className="px-4 py-2 text-left">Найменування</th>
                      <th className="px-4 py-2 text-right">Норма годин</th>
                      <th className="px-4 py-2 text-right">Ціна за годину</th>
                      <th className="px-4 py-2 text-right">Сума</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((item, index) => (
                      <tr key={item.specificationId} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={(e) => handleItemChange(
                              formData.items.indexOf(item),
                              'selected',
                              e.target.checked
                            )}
                          />
                        </td>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2 text-right">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max={item.maxQuantity}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(
                              formData.items.indexOf(item),
                              'quantity',
                              parseFloat(e.target.value) || 0
                            )}
                            disabled={!item.selected}
                            className="w-20 text-right border rounded px-2 py-1"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.price)} ₴</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.amount)} ₴</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Таблиця запчастин */}
            {parts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Запчастини</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2"></th>
                      <th className="px-4 py-2 text-left">Найменування</th>
                      <th className="px-4 py-2 text-right">Кількість</th>
                      <th className="px-4 py-2 text-right">Ціна</th>
                      <th className="px-4 py-2 text-right">Сума</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((item, index) => (
                      <tr key={item.specificationId} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={(e) => handleItemChange(
                              formData.items.indexOf(item),
                              'selected',
                              e.target.checked
                            )}
                          />
                        </td>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2 text-right">
                          <input
                            type="number"
                            min="0"
                            max={item.maxQuantity}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(
                              formData.items.indexOf(item),
                              'quantity',
                              parseInt(e.target.value) || 0
                            )}
                            disabled={!item.selected}
                            className="w-20 text-right border rounded px-2 py-1"
                          />
                          <span className="ml-2">{item.unit}</span>
                        </td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.price)} ₴</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.amount)} ₴</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <div className="text-xl font-bold">
                Загальна сума: {formatCurrency(totalAmount)} ₴
              </div>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Створити акт
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
