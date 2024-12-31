import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import SpecificationUpload from '@/components/SpecificationUpload';
import Specification2210 from '@/components/specifications/2210';
import Specification2240 from '@/components/specifications/2240';
import Specification3110 from '@/components/specifications/3110';
import DkCodeAutocomplete from '@/components/DkCodeAutocomplete';
import DkLimitInfo from '@/components/DkLimitInfo';
import { CONTRACT_TYPE_OPTIONS } from '@/constants/contractTypes';
import { checkDirectContractLimit, formatLimitErrorMessage } from '../../utils/contractLimits';

export default function NewContract() {
  const router = useRouter();
  const { budgetId, kekvId } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(budgetId || '');
  const [selectedKekv, setSelectedKekv] = useState(kekvId || '');
  const [specifications, setSpecifications] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [kekvs, setKekvs] = useState([]);
  const [budgetContracts, setBudgetContracts] = useState([]);
  const [formData, setFormData] = useState({
    dk: null,
    contractor: '',
    amount: '0',
    contractType: CONTRACT_TYPE_OPTIONS[0], // По умолчанию "Прямий"
  });

  // Вычисляем общую сумму спецификаций
  const totalAmount = useMemo(() => {
    return specifications.reduce((sum, spec) => {
      const baseAmount = parseFloat(spec.price || 0) * parseFloat(spec.quantity || 0);
      return sum + (spec.type === 'service' ? baseAmount * (spec.serviceCount || 1) : baseAmount);
    }, 0);
  }, [specifications]);

  // Обновляем formData.amount при изменении totalAmount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      amount: totalAmount.toString()
    }));
  }, [totalAmount]);

  // Загрузка бюджетов при монтировании компонента
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await fetch('/api/budgets');
        if (!response.ok) throw new Error('Failed to fetch budgets');
        const data = await response.json();
        setBudgets(data);
      } catch (err) {
        setError('Помилка завантаження кошторисів');
        console.error('Error fetching budgets:', err);
      }
    };

    fetchBudgets();
  }, []);

  // Загрузка КЕКВ при выборе бюджета
  useEffect(() => {
    const fetchKekvs = async () => {
      if (!selectedBudget) {
        setKekvs([]);
        return;
      }

      try {
        const response = await fetch(`/api/budgets/${selectedBudget}/kekvs`);
        if (!response.ok) throw new Error('Failed to fetch KEKVs');
        const data = await response.json();
        setKekvs(data);
      } catch (err) {
        setError('Помилка завантаження КЕКВ');
        console.error('Error fetching KEKVs:', err);
      }
    };

    fetchKekvs();
  }, [selectedBudget]);

  // Загрузка договоров при монтировании компонента и при изменении бюджета
  useEffect(() => {
    const fetchBudgetContracts = async () => {
      if (!selectedBudget) {
        setBudgetContracts([]);
        return;
      }

      try {
        const response = await fetch(`/api/budgets/${selectedBudget}/contracts`);
        if (!response.ok) throw new Error('Failed to fetch budget contracts');
        const data = await response.json();
        console.log('Loaded contracts:', data); // Добавляем лог для отладки
        setBudgetContracts(data);
      } catch (err) {
        console.error('Error fetching budget contracts:', err);
        setError('Помилка завантаження договорів');
      }
    };

    fetchBudgetContracts();
  }, [selectedBudget]);

  // Установка начальных значений из URL
  useEffect(() => {
    if (budgetId) {
      setSelectedBudget(budgetId);
    }
    if (kekvId) {
      setSelectedKekv(kekvId);
    }
  }, [budgetId, kekvId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Если это прямой договор, проверяем лимиты
      if (formData.contractType === 'Прямий') {
        // Получаем существующие договора для этого бюджета
        const contractsResponse = await fetch(`/api/budgets/${selectedBudget}/contracts`);
        if (!contractsResponse.ok) {
          throw new Error('Помилка при отриманні списку договорів');
        }
        const existingContracts = await contractsResponse.json();

        // Проверяем лимит
        const limitCheck = checkDirectContractLimit(
          totalAmount,
          existingContracts,
          formData.dk?.code
        );

        if (!limitCheck.isValid) {
          throw new Error(formatLimitErrorMessage(limitCheck, formData.dk?.code));
        }
      }
      
      const contractData = {
        dkCode: formData.dk?.code,
        dkName: formData.dk?.name,
        contractor: formData.contractor,
        amount: totalAmount,
        budgetId: selectedBudget,
        kekvId: selectedKekv,
        specifications: specifications,
        contractType: formData.contractType,
      };

      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Помилка при створенні договору');
      }

      router.push('/contracts');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSpecificationUpload = async (data) => {
    try {
      setError(null);
      // Преобразуем спецификации в простой объект без циклических ссылок
      const cleanSpecifications = data.map(spec => ({
        name: spec.name,
        code: spec.code || null,
        unit: spec.unit,
        quantity: spec.quantity,
        price: spec.price,
        amount: spec.amount,
        total: spec.total,
        serviceCount: spec.serviceCount || 1,
        section: spec.section,
        vehicleBrand: spec.vehicleBrand,
        vehicleVin: spec.vehicleVin,
        vehicleLocation: spec.vehicleLocation
      }));

      setSpecifications(cleanSpecifications);
    } catch (error) {
      setError('Помилка обробки специфікації');
      console.error('Error processing specification:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Новий договір</title>
      </Head>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Новий договір</h1>
        <Link href="/contracts" className="text-blue-500 hover:text-blue-700">
          Назад
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Выбор кошториса */}
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
            Кошторис
          </label>
          <select
            id="budget"
            value={selectedBudget}
            onChange={(e) => setSelectedBudget(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            required
          >
            <option value="">Оберіть кошторис</option>
            {budgets.map((budget) => (
              <option key={budget.id} value={budget.id}>
                {budget.name}
              </option>
            ))}
          </select>
        </div>

        {/* Выбор КЕКВ */}
        <div>
          <label htmlFor="kekv" className="block text-sm font-medium text-gray-700">
            КЕКВ
          </label>
          <select
            id="kekv"
            value={selectedKekv}
            onChange={(e) => setSelectedKekv(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            required
            disabled={!selectedBudget}
          >
            <option value="">Оберіть КЕКВ</option>
            {kekvs.map((kekv) => (
              <option key={kekv.id} value={kekv.id}>
                {kekv.code} - {kekv.name}
              </option>
            ))}
          </select>
        </div>

        {/* Тип договора */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Тип договору</span>
          </label>
          <select
            name="contractType"
            className="select select-bordered w-full"
            value={formData.contractType}
            onChange={handleChange}
            required
          >
            {CONTRACT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* ДК код */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Код ДК та назва предмету закупівлі
          </label>
          <DkCodeAutocomplete
            value={formData.dk}
            onChange={(newValue) => setFormData(prev => ({ ...prev, dk: newValue }))}
          />
          
          {/* Информация о лимитах */}
          {formData.dk && (
            <DkLimitInfo
              dkCode={formData.dk.code}
              dkName={formData.dk.name}
              contracts={budgetContracts}
              contractType={formData.contractType}
              currentAmount={totalAmount}
            />
          )}
        </div>

        {/* Контрагент */}
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

        {selectedKekv && (
          <div className="mt-6">
            {(() => {
              const kekvCode = kekvs.find(k => k.id === selectedKekv)?.code;
              switch(kekvCode) {
                case '2210':
                  return (
                    <Specification2210 
                      kekv="2210" 
                      onSpecificationsLoaded={handleSpecificationUpload} 
                    />
                  );
                case '2240':
                  return (
                    <Specification2240 
                      kekv="2240" 
                      onSpecificationsLoaded={handleSpecificationUpload} 
                    />
                  );
                case '3110':
                  return (
                    <Specification3110 
                      kekv="3110" 
                      onSpecificationsLoaded={handleSpecificationUpload} 
                    />
                  );
                default:
                  return (
                    <SpecificationUpload 
                      kekv={kekvCode} 
                      onSpecificationsLoaded={handleSpecificationUpload}
                    />
                  );
              }
            })()}
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => router.push('/contracts')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </form>
    </div>
  );
}
