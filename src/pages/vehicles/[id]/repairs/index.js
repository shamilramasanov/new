import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { formatCurrency } from '@/utils/format';
import styles from '@/styles/VehicleDetails.module.css';
import CreateActModal from '@/components/CreateActModal';

export default function VehicleRepairsPage({ vehicle, repairs, error }) {
  const router = useRouter();
  const { id: vehicleId } = router.query;
  
  const [showCreateActModal, setShowCreateActModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [expandedContracts, setExpandedContracts] = useState(new Set());
  const [id, setId] = useState(vehicleId);
  const [repairsData, setRepairsData] = useState(repairs || []);
  const [vehicleData, setVehicleData] = useState(vehicle || null);
  const [isLoading, setIsLoading] = useState(!vehicle && !!vehicleId);

  useEffect(() => {
    console.log('Modal state:', { showCreateActModal, selectedContract });
  }, [showCreateActModal, selectedContract]);

  useEffect(() => {
    if (!vehicle && vehicleId) {
      setIsLoading(true);
      fetch(`/api/vehicles/${vehicleId}`)
        .then(res => res.json())
        .then(data => {
          setVehicleData(data);
          setId(data.id);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error loading vehicle:', error);
          setIsLoading(false);
        });
    }
  }, [vehicle, vehicleId]);

  
  
  const toggleContract = (contractId) => {
    setExpandedContracts(prev => {
      const next = new Set(prev);
      if (next.has(contractId)) {
        next.delete(contractId);
      } else {
        next.add(contractId);
      }
      return next;
    });
  };

  const handleCreateAct = async (actData) => {
    try {
      const response = await fetch(`/api/acts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actData),
      });

      if (!response.ok) {
        throw new Error('Failed to create act');
      }

      // Оновлюємо дані на сторінці
      const vehicleResponse = await fetch(`/api/vehicles/${id}`);
      const vehicleData = await vehicleResponse.json();
      setVehicleData(vehicleData);
      setRepairsData(vehicleData.repairs || []);

      // Закриваємо модальне вікно
      setShowCreateActModal(false);
      setSelectedContract(null);
    } catch (error) {
      console.error('Error creating act:', error);
      // Тут можна додати відображення помилки користувачу
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className={styles.container}>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">Автомобіль не знайдено</div>
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

  if (router.isFallback) {
    return <div className={styles.container}>Завантаження...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/vehicles" className={styles.backLink}>
        ← Повернутися до реєстру
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>
          {vehicleData.brand} {vehicleData.model}
          <span className={styles.vehicleNumber}>{vehicleData.number}</span>
        </h1>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Бортовий номер</span>
            <span className={styles.infoValue}>{vehicleData.number}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Пробіг</span>
            <span className={styles.infoValue}>
              {vehicleData.mileage ? `${vehicleData.mileage.toLocaleString()} км` : 'Не вказано'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Рік випуску</span>
            <span className={styles.infoValue}>{vehicleData.year || 'Не вказано'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>VIN-код</span>
            <span className={styles.infoValue}>{vehicleData.vin || 'Не вказано'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Місце дислокації</span>
            <span className={styles.infoValue}>{vehicleData.location || 'Не вказано'}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => router.push(`/vehicles/${vehicleData.id}/edit`)}
            className={styles.secondaryButton}
          >
            Редагувати
          </button>
          <Link
            href={`/contracts/new?vehicleId=${vehicleData.id}`}
            className={styles.primaryButton}
          >
            Додати ремонт
          </Link>
          <button 
            onClick={() => router.push(`/vehicles/${vehicleData.id}/mileage`)}
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
            href={`/contracts/new?vehicleId=${vehicleData.id}`}
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
                  <div className="mt-4 space-y-4">
                    {/* Кнопки действий */}
                    <div className="flex justify-end space-x-2 mb-4">
                      <Link
                        href={`/contracts/${repair.id}`}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Переглянути договір
                      </Link>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/contracts/${repair.id}`);
                            const contractData = await response.json();
                            setSelectedContract(contractData);
                            setShowCreateActModal(true);
                          } catch (error) {
                            console.error('Error fetching contract:', error);
                            alert('Помилка при завантаженні даних договору');
                          }
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Створити акт
                      </button>
                    </div>

                    {/* Услуги */}
                    {repair.specifications?.filter(spec => spec.type === 'service').length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Послуги</h4>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left">Найменування</th>
                              <th className="px-4 py-2 text-left">Од. виміру</th>
                              <th className="px-4 py-2 text-right">К-сть</th>
                              <th className="px-4 py-2 text-right">Ціна</th>
                              <th className="px-4 py-2 text-right">К-ть обсл.</th>
                              <th className="px-4 py-2 text-right">Сума</th>
                            </tr>
                          </thead>
                          <tbody>
                            {repair.specifications
                              .filter(spec => spec.type === 'service')
                              .map((spec, index) => (
                                <tr key={spec.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                  <td className="px-4 py-2">{spec.name}</td>
                                  <td className="px-4 py-2">{spec.unit}</td>
                                  <td className="px-4 py-2 text-right">{spec.quantity}</td>
                                  <td className="px-4 py-2 text-right">{formatCurrency(spec.price)} ₴</td>
                                  <td className="px-4 py-2 text-right">{spec.serviceCount}</td>
                                  <td className="px-4 py-2 text-right">{formatCurrency(spec.amount)} ₴</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Запчасти */}
                    {repair.specifications?.filter(spec => spec.type === 'part').length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Запчастини</h4>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left">Найменування</th>
                              <th className="px-4 py-2 text-left">Од. виміру</th>
                              <th className="px-4 py-2 text-right">К-сть</th>
                              <th className="px-4 py-2 text-right">Ціна</th>
                              <th className="px-4 py-2 text-right">Сума</th>
                            </tr>
                          </thead>
                          <tbody>
                            {repair.specifications
                              .filter(spec => spec.type === 'part')
                              .map((spec, index) => (
                                <tr key={spec.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                  <td className="px-4 py-2">{spec.name}</td>
                                  <td className="px-4 py-2">{spec.unit}</td>
                                  <td className="px-4 py-2 text-right">{spec.quantity}</td>
                                  <td className="px-4 py-2 text-right">{formatCurrency(spec.price)} ₴</td>
                                  <td className="px-4 py-2 text-right">{formatCurrency(spec.amount)} ₴</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Ще немає договорів на ремонт для цього автомобіля</p>
            <Link
              href={`/contracts/new?vehicleId=${vehicleData.id}`}
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
  if (!params?.id) {
    return {
      props: {
        vehicle: null,
        repairs: [],
      },
    };
  }

  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
    
    const vehicleResponse = await fetch(`${baseUrl}/api/vehicles/${params.id}`);

    if (!vehicleResponse.ok) {
      console.error('Failed to fetch data:', {
        vehicleStatus: vehicleResponse.status
      });
      throw new Error('Failed to fetch data');
    }

    const vehicleData = await vehicleResponse.json();

    return {
      props: {
        vehicle: vehicleData,
        repairs: vehicleData.repairs || [],
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        vehicle: null,
        repairs: [],
        error: error.message
      },
    };
  }
}
