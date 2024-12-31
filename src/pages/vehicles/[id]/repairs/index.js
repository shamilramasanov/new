import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { formatCurrency } from '@/utils/format';
import styles from '@/styles/VehicleDetails.module.css';
import CreateActModal from '@/components/CreateActModal';

export default function VehicleRepairsPage({ vehicle, repairs }) {
  const router = useRouter();
  const [expandedContracts, setExpandedContracts] = useState(new Set());
  const [showCreateActModal, setShowCreateActModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [id, setId] = useState(vehicle.id);
  const [repairsData, setRepairsData] = useState(repairs);

  const toggleContract = (contractId) => {
    setExpandedContracts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contractId)) {
        newSet.delete(contractId);
      } else {
        newSet.add(contractId);
      }
      return newSet;
    });
  };

  const handleCreateAct = async (formData) => {
    try {
      const response = await fetch('/api/acts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          contractId: selectedContract.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create act');
      }

      // Обновляем данные на странице
      const repairsResponse = await fetch(`/api/vehicles/${id}/repairs`);
      const repairsData = await repairsResponse.json();
      setRepairsData(repairsData);

      // Закрываем модальное окно
      setShowCreateActModal(false);
      setSelectedContract(null);
    } catch (error) {
      console.error('Error creating act:', error);
      alert('Помилка при створенні акту');
    }
  };

  if (router.isFallback) {
    return <div className={styles.container}>Завантаження...</div>;
  }

  if (!vehicle) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          Автомобіль не знайдено
        </div>
      </div>
    );
  }

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

  const getStatusText = (status) => {
    switch (status) {
      case 'PLANNED': return 'Заплановано';
      case 'ACTIVE': return 'В роботі';
      case 'COMPLETED': return 'Завершено';
      case 'CANCELLED': return 'Скасовано';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PLANNED': return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/vehicles" className={styles.backLink}>
        ← Повернутися до реєстру
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>
          {vehicle.brand} {vehicle.model}
          <span className={styles.vehicleNumber}>{vehicle.number}</span>
        </h1>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Бортовий номер</span>
            <span className={styles.infoValue}>{vehicle.number}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Пробіг</span>
            <span className={styles.infoValue}>
              {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} км` : 'Не вказано'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Рік випуску</span>
            <span className={styles.infoValue}>{vehicle.year || 'Не вказано'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>VIN-код</span>
            <span className={styles.infoValue}>{vehicle.vin || 'Не вказано'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Місце дислокації</span>
            <span className={styles.infoValue}>{vehicle.location || 'Не вказано'}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => router.push(`/vehicles/${vehicle.id}/edit`)}
            className={styles.secondaryButton}
          >
            Редагувати
          </button>
          <Link
            href={`/contracts/new?vehicleId=${vehicle.id}`}
            className={styles.primaryButton}
          >
            Додати ремонт
          </Link>
          <button 
            onClick={() => router.push(`/vehicles/${vehicle.id}/mileage`)}
            className={styles.secondaryButton}
          >
            Історія пробігу
          </button>
        </div>
      </div>

      <div className={styles.repairsSection}>
        <div className={styles.repairsHeader}>
          <h2 className={styles.repairsTitle}>Договори на ремонт</h2>
          <Link
            href={`/contracts/new?vehicleId=${vehicle.id}`}
            className={styles.primaryButton}
          >
            Додати договір
          </Link>
        </div>

        {repairsData?.length > 0 ? (
          <div className={styles.repairsList}>
            {repairsData.map((repair) => (
              <div key={repair.id} className={styles.repairCard}>
                <div 
                  className={styles.repairHeader}
                  onClick={() => toggleContract(repair.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.repairInfo}>
                    <h3 className={styles.repairNumber}>
                      Договір №{repair.number || 'б/н'}
                    </h3>
                    <div className={styles.repairDates}>
                      <span>від {formatDate(repair.startDate)}</span>
                      {repair.endDate && (
                        <span> до {formatDate(repair.endDate)}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.repairStatusWrapper}>
                    <span className={`${styles.repairStatus} ${getStatusClass(repair.status)}`}>
                      {getStatusText(repair.status)}
                    </span>
                    <span className={styles.repairAmount}>
                      {formatCurrency(repair.amount)} ₴
                      <span className="text-sm text-gray-500 ml-2">
                        (Залишок: {formatCurrency(repair.amount - (repair.acts?.filter(act => act.status === 'ACTIVE').reduce((sum, act) => sum + act.totalAmount, 0) || 0))} ₴)
                      </span>
                    </span>
                  </div>
                </div>
                
                {expandedContracts.has(repair.id) && (
                  <>
                    <div className={styles.specificationsSection}>
                      <h4 className={styles.specificationsTitle}>
                        Специфікації:
                      </h4>

                      {/* Послуги */}
                      <div className="mb-6">
                        <h5 className="text-sm font-semibold mb-2">Послуги</h5>
                        <table className={styles.specificationsTable}>
                          <thead>
                            <tr>
                              <th>№</th>
                              <th>Найменування</th>
                              <th>Од. виміру</th>
                              <th>К-сть</th>
                              <th>Ціна</th>
                              <th>К-ть обсл.</th>
                              <th>Сума</th>
                            </tr>
                          </thead>
                          <tbody>
                            {repair.specifications
                              ?.filter(spec => spec.section === 'Послуги')
                              .map((spec, index) => (
                                <tr key={spec.id}>
                                  <td>{index + 1}</td>
                                  <td>{spec.name}</td>
                                  <td>{spec.unit}</td>
                                  <td className="text-right">{Number(spec.quantity).toFixed(2)}</td>
                                  <td className="text-right">{formatCurrency(spec.price)}</td>
                                  <td className="text-right">{Number(spec.serviceCount).toFixed(2)}</td>
                                  <td className="text-right">{formatCurrency(spec.amount)}</td>
                                </tr>
                            ))}
                            <tr>
                              <td colSpan="6" className="text-right font-semibold">Разом за послуги:</td>
                              <td className="text-right font-semibold">
                                {formatCurrency(repair.specifications
                                  ?.filter(spec => spec.section === 'Послуги')
                                  .reduce((sum, spec) => sum + spec.amount, 0) || 0
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Використані запчастини */}
                      <div>
                        <h5 className="text-sm font-semibold mb-2">Використані запчастини</h5>
                        <table className={styles.specificationsTable}>
                          <thead>
                            <tr>
                              <th>№</th>
                              <th>Найменування</th>
                              <th>Код</th>
                              <th>Од. виміру</th>
                              <th>К-сть</th>
                              <th>Ціна</th>
                              <th>Сума</th>
                            </tr>
                          </thead>
                          <tbody>
                            {repair.specifications
                              ?.filter(spec => spec.section === 'Використані запчастини')
                              .map((spec, index) => (
                                <tr key={spec.id}>
                                  <td>{index + 1}</td>
                                  <td>{spec.name}</td>
                                  <td>{spec.code || '-'}</td>
                                  <td>{spec.unit}</td>
                                  <td className="text-right">{Number(spec.quantity).toFixed(2)}</td>
                                  <td className="text-right">{formatCurrency(spec.price)}</td>
                                  <td className="text-right">{formatCurrency(spec.amount)}</td>
                                </tr>
                            ))}
                            <tr>
                              <td colSpan="6" className="text-right font-semibold">Разом за запчастини:</td>
                              <td className="text-right font-semibold">
                                {formatCurrency(repair.specifications
                                  ?.filter(spec => spec.section === 'Використані запчастини')
                                  .reduce((sum, spec) => sum + spec.amount, 0) || 0
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Общая сумма */}
                      <div className="mt-4 text-right">
                        <p className="font-semibold">
                          Разом по автомобілю: {formatCurrency(repair.amount)} грн
                        </p>
                        <p className="font-semibold mt-2">
                          Загальна сума: {formatCurrency(repair.amount)} грн
                        </p>
                      </div>
                    </div>
                    
                    <div className={styles.repairFooter}>
                      <div className={styles.repairActions}>
                        <button
                          onClick={() => router.push(`/contracts/${repair.id}/edit`)}
                          className={styles.secondaryButton}
                        >
                          Редагувати
                        </button>
                        <button className={styles.secondaryButton}>
                          Друк
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedContract(repair);
                            setShowCreateActModal(true);
                          }}
                          className={styles.secondaryButton}
                        >
                          Створити акт
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Ще немає договорів на ремонт для цього автомобіля</p>
            <Link
              href={`/contracts/new?vehicleId=${vehicle.id}`}
              className={styles.primaryButton}
            >
              Додати перший договір
            </Link>
          </div>
        )}
      </div>
      {showCreateActModal && selectedContract && (
        <CreateActModal
          contract={selectedContract}
          onClose={() => {
            setShowCreateActModal(false);
            setSelectedContract(null);
          }}
          onSubmit={handleCreateAct}
        />
      )}
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const [vehicleResponse, repairsResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/vehicles/${params.id}`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/vehicles/${params.id}/repairs`)
    ]);
    
    if (!vehicleResponse.ok || !repairsResponse.ok) {
      throw new Error('Failed to fetch data');
    }

    const [vehicle, repairs] = await Promise.all([
      vehicleResponse.json(),
      repairsResponse.json()
    ]);

    return {
      props: {
        vehicle,
        repairs,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        vehicle: null,
        repairs: [],
      },
    };
  }
}
