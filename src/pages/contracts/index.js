import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { formatMoney } from '../../shared/utils/format';
import { prisma } from '../../lib/prisma';

const CONTRACT_STATUSES = [
  { value: '', label: 'Всі статуси' },
  { value: 'PLANNED', label: 'Заплановано' },
  { value: 'DRAFT', label: 'Чернетка' },
  { value: 'ACTIVE', label: 'Активний' },
  { value: 'COMPLETED', label: 'Завершено' },
  { value: 'TERMINATED', label: 'Розірвано' }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'PLANNED':
      return 'bg-yellow-100 text-yellow-800';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800';
    case 'TERMINATED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ContractsPage({ contracts: initialContracts = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [contracts, setContracts] = useState(initialContracts);
  const router = useRouter();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/contracts');
      const data = await response.json();
      setContracts(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  const handleDeleteContract = async (id, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Ви впевнені, що хочете видалити цей договір?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contract');
      }

      setContracts(contracts.filter(contract => contract.id !== id));
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Помилка при видаленні договору');
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = searchTerm === '' || 
      (contract.number && contract.number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      contract.contractor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Head>
        <title>Реєстр договорів | My Budget App</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Реєстр договорів</h1>
              <p className="text-sm text-gray-500 mt-1">
                Кількість договорів: {filteredContracts.length}
                {searchTerm && ` (знайдено: ${filteredContracts.length} з ${contracts.length})`}
              </p>
            </div>
            <Link
              href="/contracts/new"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + Новий договір
            </Link>
          </div>

          {/* Фильтры */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Input
                type="text"
                placeholder="Пошук за номером або контрагентом..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {CONTRACT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Список договоров */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredContracts.map(contract => (
                <li key={contract.id}>
                  <div 
                    className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/contracts/${contract.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {contract.number || 'Без номеру'}
                        </p>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                          {CONTRACT_STATUSES.find(s => s.value === contract.status)?.label || 'Невідомо'}
                        </span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <button
                          onClick={(e) => handleDeleteContract(contract.id, e)}
                          className="ml-2 px-2 py-1 text-xs text-red-600 hover:text-red-900"
                        >
                          Видалити
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {contract.contractor}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p className="text-sm font-medium text-gray-900">
                          {formatMoney(contract.amount)} грн
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {contract.dkCode} - {contract.dkName}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {contract.kekv?.code} - {contract.kekv?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        budget: true,
        kekv: true,
      },
    });

    // Преобразуем даты в строки для корректной сериализации
    const serializedContracts = contracts.map(contract => ({
      ...contract,
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
      startDate: contract.startDate ? contract.startDate.toISOString() : null,
      endDate: contract.endDate ? contract.endDate.toISOString() : null,
      budget: {
        ...contract.budget,
        date: contract.budget.date.toISOString(),
        createdAt: contract.budget.createdAt.toISOString(),
        updatedAt: contract.budget.updatedAt.toISOString(),
      },
      kekv: {
        ...contract.kekv,
        createdAt: contract.kekv.createdAt.toISOString(),
        updatedAt: contract.kekv.updatedAt.toISOString(),
      }
    }));

    return {
      props: {
        contracts: serializedContracts,
      },
    };
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return {
      props: {
        contracts: [],
      },
    };
  }
}
