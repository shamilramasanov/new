import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatDate, formatCurrency } from '../../utils/dateUtils';
import SpecificationDisplayRenderer from '@/components/specifications/2240/SpecificationDisplayRenderer';
import ContractStatusManager from '@/components/contracts/ContractStatusManager';

export default function ContractDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    if (id) {
      fetchContract();
    }
  }, [id]);

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/contracts/${id}`);
      if (!response.ok) {
        throw new Error('Помилка завантаження договору');
      }
      const data = await response.json();
      setContract(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (updateData) => {
    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Помилка оновлення статусу');
      }

      const updatedContract = await response.json();
      setContract(updatedContract);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Ви впевнені, що хочете видалити цей договір?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contract');
      }

      router.push('/contracts');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;
  if (!contract) return <div>Договір не знайдено</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Шапка */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">
              {contract.status === 'PLANNED' ? 'Запланований договір' : `Договір №${contract.number || ''}`}
            </h1>
            <div className="flex space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Змінити статус
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>

        {/* Управление статусом */}
        {isEditing && (
          <div className="px-6 py-4 border-b border-gray-200">
            <ContractStatusManager
              contract={contract}
              onSave={handleStatusUpdate}
            />
          </div>
        )}

        {/* Основна інформація */}
        <div className="px-6 py-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Контрагент</p>
            <p className="font-medium">{contract.contractor}</p>
          </div>
          <div>
            <p className="text-gray-600">Сума</p>
            <p className="font-medium">{formatCurrency(contract.amount)}</p>
          </div>
          {contract.status === 'ACTIVE' && (
            <>
              <div>
                <p className="text-gray-600">Дата початку</p>
                <p className="font-medium">{formatDate(contract.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-600">Дата закінчення</p>
                <p className="font-medium">{formatDate(contract.endDate)}</p>
              </div>
            </>
          )}
          <div>
            <p className="text-gray-600">Статус</p>
            <p className="font-medium">
              {contract.status === 'PLANNED' && 'Заплановано'}
              {contract.status === 'DRAFT' && 'Чернетка'}
              {contract.status === 'ACTIVE' && 'Активний'}
              {contract.status === 'COMPLETED' && 'Завершено'}
              {contract.status === 'TERMINATED' && 'Розірвано'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">КЕКВ</p>
            <p className="font-medium">{contract.kekv?.code} - {contract.kekv?.name}</p>
          </div>
        </div>

        {/* Специфікації */}
        <div className="px-6 py-4">
          <h2 className="text-lg font-medium mb-4">Специфікації</h2>
          {contract.kekv?.code === '2240' ? (
            <SpecificationDisplayRenderer specifications={contract.specifications} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Найменування</th>
                    <th className="px-4 py-2 text-left">Код</th>
                    <th className="px-4 py-2 text-left">Од. вим.</th>
                    <th className="px-4 py-2 text-right">К-сть</th>
                    <th className="px-4 py-2 text-right">Ціна</th>
                    <th className="px-4 py-2 text-right">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {contract.specifications.map((spec, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{spec.name}</td>
                      <td className="border px-4 py-2">{spec.code}</td>
                      <td className="border px-4 py-2">{spec.unit}</td>
                      <td className="border px-4 py-2 text-right">{spec.quantity}</td>
                      <td className="border px-4 py-2 text-right">{formatCurrency(spec.price)}</td>
                      <td className="border px-4 py-2 text-right">{formatCurrency(spec.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Акти і залишки */}
        <div className="px-6 py-4">
          <h2 className="text-lg font-medium mb-4">Акти виконаних робіт та залишки</h2>
          <div className="flex justify-between items-center mb-4">
            <button
              className={`${activeTab === 'services' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} px-4 py-2 rounded hover:bg-blue-600`}
              onClick={() => setActiveTab('services')}
            >
              Послуги
            </button>
            <button
              className={`${activeTab === 'parts' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} px-4 py-2 rounded hover:bg-blue-600`}
              onClick={() => setActiveTab('parts')}
            >
              Запчастини
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Код</th>
                  <th className="px-4 py-2 text-left">Найменування</th>
                  <th className="px-4 py-2 text-left">Од. вим.</th>
                  <th className="px-4 py-2 text-right">К-сть</th>
                  <th className="px-4 py-2 text-right">Використано</th>
                  <th className="px-4 py-2 text-right">Залишок</th>
                  <th className="px-4 py-2 text-right">Ціна</th>
                  <th className="px-4 py-2 text-right">Сума</th>
                </tr>
              </thead>
              <tbody>
                {contract.specifications
                  .filter(spec => 
                    activeTab === 'services' ? spec.section === 'SERVICES' : spec.section === 'PARTS'
                  )
                  .map((spec) => (
                    <tr key={spec.id}>
                      <td className="border px-4 py-2">{spec.code}</td>
                      <td className="border px-4 py-2">{spec.name}</td>
                      <td className="border px-4 py-2">{spec.unit}</td>
                      <td className="border px-4 py-2 text-right">{spec.quantity}</td>
                      <td className="border px-4 py-2 text-right">{spec.usedQuantity}</td>
                      <td className="border px-4 py-2 text-right">{spec.remainingQuantity}</td>
                      <td className="border px-4 py-2 text-right">{formatCurrency(spec.price)}</td>
                      <td className="border px-4 py-2 text-right">{formatCurrency(spec.amount)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <h2 className="text-lg font-medium mb-4 mt-8">Акти виконаних робіт</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Номер</th>
                  <th className="px-4 py-2 text-left">Дата</th>
                  <th className="px-4 py-2 text-left">Статус</th>
                  <th className="px-4 py-2 text-right">Сума</th>
                  <th className="px-4 py-2 text-right">Дії</th>
                </tr>
              </thead>
              <tbody>
                {contract.acts.map((act) => (
                  <tr key={act.id}>
                    <td className="border px-4 py-2">{act.number || '—'}</td>
                    <td className="border px-4 py-2">{act.date ? new Date(act.date).toLocaleDateString() : '—'}</td>
                    <td className="border px-4 py-2">
                      <span className={`text-${act.status.toLowerCase()}`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-right">{formatCurrency(act.totalAmount)}</td>
                    <td className="border px-4 py-2 text-right">
                      <div className="flex justify-end">
                        <Link href={`/acts/${act.id}`}>
                          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Переглянути
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="border px-4 py-2 text-right font-medium">Всього за актами:</td>
                  <td className="border px-4 py-2 text-right">{formatCurrency(contract.usedAmount)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan="3" className="border px-4 py-2 text-right font-medium">Залишок за договором:</td>
                  <td className="border px-4 py-2 text-right">{formatCurrency(contract.remainingAmount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
