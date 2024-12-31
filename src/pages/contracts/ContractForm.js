import { useState, useEffect } from 'react';
import { Input } from '../../shared/components/ui/Input';
import { DkCodeAutocomplete } from '../../shared/components/DkCodeAutocomplete';
import SpecificationUpload from '../../components/SpecificationUpload';

export default function ContractForm({ onSuccess }) {
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [kekvs, setKekvs] = useState([]);
  const [selectedKekv, setSelectedKekv] = useState(null);
  const [specifications, setSpecifications] = useState([]);
  const [formData, setFormData] = useState({
    number: '',
    dk: null,
    contractor: '',
    amount: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await fetch('/api/budgets');
        const data = await response.json();
        setBudgets(data);
      } catch (error) {
        console.error('Error fetching budgets:', error);
        setError('Помилка при завантаженні кошторисів');
      }
    };
    fetchBudgets();
  }, []);

  useEffect(() => {
    const fetchKekv = async () => {
      if (selectedBudget) {
        try {
          const response = await fetch(`/api/kekv?budgetId=${selectedBudget}`);
          if (!response.ok) {
            throw new Error('Failed to fetch KEKV');
          }
          const data = await response.json();
          setKekvs(data);
          setSelectedKekv(null);
        } catch (error) {
          console.error('Error fetching KEKV:', error);
          setError('Помилка при завантаженні КЕКВ');
          setKekvs([]);
          setSelectedKekv(null);
        }
      } else {
        setKekvs([]);
        setSelectedKekv(null);
      }
    };
    fetchKekv();
  }, [selectedBudget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          budgetId: selectedBudget,
          kekvId: selectedKekv,
          specifications
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Помилка при створенні договору');
      }

      onSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {error && (
            <div className="bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Кошторис
              <select
                className="mt-1 block w-full bg-white rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={selectedBudget || ''}
                onChange={(e) => setSelectedBudget(e.target.value)}
                required
              >
                <option value="">Оберіть кошторис</option>
                {budgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name} - {new Date(budget.date).toLocaleDateString()} 
                    (Доступно: {budget.totalAmount - budget.usedAmount} грн)
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              КЕКВ
              <select
                className="mt-1 block w-full bg-white rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={selectedKekv || ''}
                onChange={(e) => setSelectedKekv(e.target.value)}
                disabled={!selectedBudget}
                required
              >
                <option value="">Оберіть КЕКВ</option>
                {kekvs.map((kekv) => (
                  <option key={kekv.id} value={kekv.id}>
                    {kekv.code} - {kekv.name} 
                    (Доступно: {kekv.plannedAmount - kekv.usedAmount} грн)
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedKekv && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Специфікація</h3>
              <SpecificationUpload
                kekv={kekvs.find(k => k.id === selectedKekv)?.code}
                onSpecificationsLoaded={(specs) => {
                  setSpecifications(specs);
                  // Рассчитываем общую сумму спецификации
                  const total = specs.reduce((sum, spec) => {
                    const amount = spec.totalWithVAT || spec.totalWithoutVAT || 0;
                    return sum + parseFloat(amount);
                  }, 0);
                  // Обновляем сумму договора
                  setFormData(prev => ({
                    ...prev,
                    amount: total.toFixed(2)
                  }));
                }}
              />
              
              {specifications.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Завантажені позиції:</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">№</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Найменування</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Код</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Од. вим.</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">К-сть</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ціна</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сума</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {specifications.map((spec, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{spec.number || (index + 1)}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{spec.name}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{spec.code}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{spec.unit}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{spec.quantity}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {parseFloat(spec.price).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {(spec.totalWithVAT || spec.totalWithoutVAT || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan="6" className="px-3 py-2 text-sm font-medium text-gray-900 text-right">
                              Загальна сума:
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {specifications.reduce((sum, spec) => sum + (spec.totalWithVAT || spec.totalWithoutVAT || 0), 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Номер договору
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Код ДК 021:2015
                <DkCodeAutocomplete
                  value={formData.dk}
                  onChange={(value) => setFormData(prev => ({ ...prev, dk: value }))}
                  className="mt-1"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Контрагент
                <input
                  type="text"
                  name="contractor"
                  value={formData.contractor}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Сума договору
                <input
                  type="text"
                  value={specifications.length > 0 
                    ? specifications.reduce((sum, spec) => sum + (spec.totalWithVAT || spec.totalWithoutVAT || 0), 0).toFixed(2)
                    : formData.amount}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50"
                  readOnly
                />
              </label>
              <p className="mt-1 text-sm text-gray-500">
                {specifications.length > 0 
                  ? '* Сума розрахована автоматично на основі специфікації'
                  : '* Завантажте специфікацію для розрахунку суми договору'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Дата початку
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Дата закінчення
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t px-4 py-3 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={loading || specifications.length === 0}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              (loading || specifications.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Збереження...
              </span>
            ) : (
              'Зберегти договір'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
