import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatCurrency } from '@/utils/format';
import styles from '@/styles/Acts.module.css';
import EditActModal from '@/components/EditActModal';

export default function ActsPage({ initialActs }) {
  const router = useRouter();
  const [acts, setActs] = useState(initialActs);
  const [selectedAct, setSelectedAct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    actNumber: '',
    contractNumber: '',
    contractor: '',
    vehicleNumber: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    try {
      return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Не вказано';
    }
  };

  const filteredActs = acts.filter(act => {
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
    const actDate = new Date(act.date);

    return (
      (!dateFrom || actDate >= dateFrom) &&
      (!dateTo || actDate <= dateTo) &&
      (!filters.actNumber || act.number.toLowerCase().includes(filters.actNumber.toLowerCase())) &&
      (!filters.contractNumber || act.contract.number?.toLowerCase().includes(filters.contractNumber.toLowerCase())) &&
      (!filters.contractor || act.contract.contractor.toLowerCase().includes(filters.contractor.toLowerCase())) &&
      (!filters.vehicleNumber || act.contract.vehicle?.number.toLowerCase().includes(filters.vehicleNumber.toLowerCase()))
    );
  });

  const handleEditAct = async (formData) => {
    try {
      const response = await fetch(`/api/acts/${selectedAct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update act');
      }

      // Перезагружаем список актов
      const responseActs = await fetch('/api/acts');
      const data = await responseActs.json();
      setActs(data);
      setShowEditModal(false);
      setSelectedAct(null);
    } catch (error) {
      console.error('Error updating act:', error);
      alert('Помилка при оновленні акту');
    }
  };

  const handleDeleteAct = async (act) => {
    if (!confirm(`Ви впевнені, що хочете видалити акт${act.number ? ` №${act.number}` : ''}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/acts/${act.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete act');
      }

      // Перезагружаем список актов
      const responseActs = await fetch('/api/acts');
      const data = await responseActs.json();
      setActs(data);
    } catch (error) {
      console.error('Error deleting act:', error);
      alert('Помилка при видаленні акту');
    }
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PAID':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Реєстр актів виконаних робіт</h1>
      </div>

      {/* Фільтри */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
            <label>Період:</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                style={{ width: '50%' }}
              />
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                style={{ width: '50%' }}
              />
            </div>
          </div>
          <div className={styles.filterItem}>
            <label>Номер акту:</label>
            <input
              type="text"
              name="actNumber"
              value={filters.actNumber}
              onChange={handleFilterChange}
              placeholder="Введіть номер"
            />
          </div>
          <div className={styles.filterItem}>
            <label>Номер договору:</label>
            <input
              type="text"
              name="contractNumber"
              value={filters.contractNumber}
              onChange={handleFilterChange}
              placeholder="Введіть номер"
            />
          </div>
        </div>
        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
            <label>Контрагент:</label>
            <input
              type="text"
              name="contractor"
              value={filters.contractor}
              onChange={handleFilterChange}
              placeholder="Введіть контрагента"
            />
          </div>
          <div className={styles.filterItem}>
            <label>Бортовий номер:</label>
            <input
              type="text"
              name="vehicleNumber"
              value={filters.vehicleNumber}
              onChange={handleFilterChange}
              placeholder="Введіть номер"
            />
          </div>
        </div>
      </div>

      {/* Таблиця актів */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>№ акту</th>
              <th>Дата</th>
              <th>№ договору</th>
              <th>Контрагент</th>
              <th>Автомобіль</th>
              <th>Сума</th>
              <th>Статус</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {filteredActs.map((act) => (
              <tr key={act.id}>
                <td>{act.number}</td>
                <td>{formatDate(act.date)}</td>
                <td>{act.contract.number || 'б/н'}</td>
                <td>{act.contract.contractor}</td>
                <td>
                  {act.contract.vehicle 
                    ? `${act.contract.vehicle.number} (${act.contract.vehicle.brand} ${act.contract.vehicle.model})`
                    : '-'
                  }
                </td>
                <td className={styles.amount}>{formatCurrency(act.totalAmount)}</td>
                <td>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(act.status)}`}>
                    {getStatusText(act.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => router.push(`/acts/${act.id}`)}
                      className={styles.viewButton}
                    >
                      Переглянути
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAct(act);
                        setShowEditModal(true);
                      }}
                      className={styles.editButton}
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => handleDeleteAct(act)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Видалити
                    </button>
                    <button
                      onClick={() => window.print()} // Здесь будет логика печати
                      className={styles.printButton}
                    >
                      Друк
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && selectedAct && (
        <EditActModal
          act={selectedAct}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAct(null);
          }}
          onSubmit={handleEditAct}
        />
      )}
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/acts`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch acts');
    }

    const acts = await response.json();

    return {
      props: {
        initialActs: acts,
      },
    };
  } catch (error) {
    console.error('Error fetching acts:', error);
    return {
      props: {
        initialActs: [],
      },
    };
  }
}
