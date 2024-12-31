import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';

export default function CreateActModal({ contract, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    number: '',
    date: '',
    items: []
  });
  const [availableSpecs, setAvailableSpecs] = useState({ services: [], parts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableSpecifications();
  }, []);

  const fetchAvailableSpecifications = async () => {
    try {
      const response = await fetch(`/api/contracts/${contract.id}/specifications/availability`);
      if (!response.ok) throw new Error('Failed to fetch specifications');
      const data = await response.json();
      setAvailableSpecs(data);
      
      // Инициализируем items с доступными спецификациями
      const initialItems = [
        ...data.services.map(spec => ({
          specificationId: spec.id,
          name: spec.name,
          quantity: 1, // для услуг всегда 1
          serviceCount: spec.availableServices[0], // берем первый доступный номер обслуживания
          price: contract.specifications.find(s => s.id === spec.id).price,
          amount: contract.specifications.find(s => s.id === spec.id).price,
          isService: true,
          selected: false
        })),
        ...data.parts.map(spec => ({
          specificationId: spec.id,
          name: spec.name,
          quantity: 0,
          maxQuantity: spec.availableQuantity,
          price: contract.specifications.find(s => s.id === spec.id).price,
          amount: 0,
          isService: false,
          selected: false
        }))
      ];
      
      setFormData(prev => ({ ...prev, items: initialItems }));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
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
          if (item.isService) {
            item.serviceCount = 0;
          }
        } else {
          // При выборе позиции устанавливаем количество 1
          item.quantity = 1;
          item.amount = item.price;
          if (item.isService) {
            item.serviceCount = 1;
          }
        }
      } else if (field === 'quantity' && !item.isService) {
        const newQuantity = Math.min(Math.max(0, value), item.maxQuantity);
        item.quantity = newQuantity;
        item.amount = newQuantity * item.price;
      } else if (field === 'serviceCount' && item.isService) {
        const newServiceCount = Math.min(Math.max(1, value), item.maxServiceCount);
        item.serviceCount = newServiceCount;
      }

      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedItems = formData.items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert('Виберіть хоча б одну позицію');
      return;
    }

    const submitData = {
      ...formData,
      items: selectedItems.map(item => ({
        specificationId: item.specificationId,
        quantity: item.quantity,
        serviceCount: item.serviceCount,
        amount: item.amount,
        isService: item.isService,
      })),
    };

    onSubmit(submitData);
  };

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;

  const totalAmount = formData.items
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Створення акту виконаних робіт</h2>
          <p className="text-sm text-gray-600">
            Договір №{contract.number || 'б/н'} від {new Date(contract.startDate).toLocaleDateString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Номер акту</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                placeholder="Буде додано при активації"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Дата акту</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                placeholder="Буде додано при активації"
                disabled
              />
            </div>
          </div>

          {/* Услуги */}
          {formData.items.some(item => item.isService) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Послуги</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const value = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              items: prev.items.map(item => 
                                item.isService ? { ...item, selected: value } : item
                              )
                            }));
                          }}
                        />
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Найменування</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">№ обслуг.</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Сума</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.filter(item => item.isService).map((item, index) => (
                      <tr key={item.specificationId}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={(e) => handleItemChange(index, 'selected', e.target.checked)}
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{item.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <select
                            disabled={!item.selected}
                            value={item.serviceCount}
                            onChange={(e) => handleItemChange(index, 'serviceCount', Number(e.target.value))}
                            className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            {availableSpecs.services
                              .find(s => s.id === item.specificationId)
                              ?.availableServices.map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Запчасти */}
          {formData.items.some(item => !item.isService) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Використані запчастини</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const value = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              items: prev.items.map(item => 
                                !item.isService ? { ...item, selected: value } : item
                              )
                            }));
                          }}
                        />
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Найменування</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кількість</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Залишок за договором</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Сума</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.filter(item => !item.isService).map((item, index) => {
                      // Находим реальный индекс элемента в общем массиве
                      const realIndex = formData.items.findIndex(i => i.specificationId === item.specificationId);
                      return (
                        <tr key={item.specificationId}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={(e) => handleItemChange(realIndex, 'selected', e.target.checked)}
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">{item.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              max={item.maxQuantity}
                              disabled={!item.selected}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(realIndex, 'quantity', Number(e.target.value))}
                              className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right">
                            <span className="text-sm text-gray-500">
                              Доступно: {item.maxQuantity} / Всього: {contract.specifications.find(s => s.id === item.specificationId).quantity}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="text-right">
              <span className="font-medium">Загальна сума: </span>
              <span className="text-lg font-semibold">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </form>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Скасувати
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Створити акт
          </button>
        </div>
      </div>
    </div>
  );
}
