import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import Link from 'next/link';

export default function InventoryItemsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minQuantity: '',
    maxQuantity: '',
    minPrice: '',
    maxPrice: '',
  });

  // Загрузка товаров и категорий
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем категории
        const categoriesResponse = await fetch('/api/inventory/categories');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Загружаем товары
        const itemsResponse = await fetch('/api/inventory/items');
        if (!itemsResponse.ok) throw new Error('Failed to fetch items');
        const itemsData = await itemsResponse.json();
        setItems(itemsData);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Фильтрация товаров
  const filteredItems = items.filter(item => {
    if (filters.category && item.categoryId !== filters.category) return false;
    if (filters.minQuantity && item.quantity < parseFloat(filters.minQuantity)) return false;
    if (filters.maxQuantity && item.quantity > parseFloat(filters.maxQuantity)) return false;
    if (filters.minPrice && item.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && item.price > parseFloat(filters.maxPrice)) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Группировка товаров по категориям для отображения
  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || {
      id: 'unknown',
      name: 'Категорія не знайдена',
      code: 'unknown'
    };
    
    if (!acc[category.id]) {
      acc[category.id] = {
        category,
        items: []
      };
    }
    acc[category.id].items.push(item);
    return acc;
  }, {});

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Склад</h1>
        <div className="flex space-x-4">
          <Input
            type="text"
            placeholder="Пошук за назвою або кодом..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setFilters({
            category: '',
            minQuantity: '',
            maxQuantity: '',
            minPrice: '',
            maxPrice: '',
          })}>
            Скинути фільтри
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Фільтри</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Категорія</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">Всі категорії</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Кількість</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Від"
                value={filters.minQuantity}
                onChange={(e) => setFilters({ ...filters, minQuantity: e.target.value })}
              />
              <Input
                type="number"
                placeholder="До"
                value={filters.maxQuantity}
                onChange={(e) => setFilters({ ...filters, maxQuantity: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ціна</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Від"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <Input
                type="number"
                placeholder="До"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Список товаров */}
      <div className="space-y-6">
        {Object.values(groupedItems).map(({ category, items }) => (
          <div key={category.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {category.name} ({category.code})
                <span className="ml-2 text-sm text-gray-500">
                  {items.length} товарів
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Код
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Назва
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Од. вим.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Кількість
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ціна
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сума
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Договір
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.unit?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.price.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(item.quantity * item.price).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.contract ? (
                          <Link href={`/contracts/${item.contract.id}`} className="text-indigo-600 hover:text-indigo-900">
                            {item.contract.number}
                          </Link>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
