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
  const [expandedActs, setExpandedActs] = useState(new Set());
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
    const newExpanded = new Set(expandedContracts);
    if (newExpanded.has(contractId)) {
      newExpanded.delete(contractId);
    } else {
      newExpanded.add(contractId);
    }
    setExpandedContracts(newExpanded);
  };

  const toggleAct = (actId) => {
    const newExpanded = new Set(expandedActs);
    if (newExpanded.has(actId)) {
      newExpanded.delete(actId);
    } else {
      newExpanded.add(actId);
    }
    setExpandedActs(newExpanded);
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

        <div className="mt-8">
          <div className="space-y-4">
            {repairsData.map((repair) => (
              <div key={repair.id} className={styles.repairCard}>
                <div 
                  className={styles.repairHeader} 
                  onClick={() => toggleContract(repair.id)}
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
                        (Використано: {formatCurrency(repair.usedAmount)} ₴)
                      </span>
                    </span>
                  </div>
                </div>
                
                {expandedContracts.has(repair.id) && (
                  <div className="mt-4 space-y-4">
                    {/* Специфікації */}
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
                                <tr key={spec.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
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

                    {/* Акти */}
                    {repair.acts?.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-2">Акти виконаних робіт</h4>
                        <div className="space-y-4">
                          {repair.acts.map((act) => (
                            <div key={act.id} className="border rounded-lg p-4 bg-gray-50">
                              <div 
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleAct(act.id)}
                              >
                                <div>
                                  <h5 className="font-medium">
                                    Акт №{act.number || 'б/н'} 
                                    {act.date && ` від ${new Date(act.date).toLocaleDateString()}`}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    Сума: {formatCurrency(act.totalAmount)} ₴
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-3 py-1 rounded text-sm ${
                                    act.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    act.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {act.status === 'PENDING' ? 'На погодженні' :
                                     act.status === 'ACTIVE' ? 'Активний' :
                                     'Оплачено'}
                                  </span>
                                  <svg
                                    className={`w-5 h-5 transition-transform ${
                                      expandedActs.has(act.id) ? 'transform rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </div>
                              </div>

                              {/* Позиції акту */}
                              {expandedActs.has(act.id) && (
                                <div className="mt-4">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                      <tr>
                                        <th className="px-4 py-2 text-left">Найменування</th>
                                        <th className="px-4 py-2 text-right">К-сть</th>
                                        <th className="px-4 py-2 text-right">Ціна</th>
                                        <th className="px-4 py-2 text-right">Сума</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {act.actItems.map((item, index) => (
                                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                          <td className="px-4 py-2">{item.specification.name}</td>
                                          <td className="px-4 py-2 text-right">
                                            {item.quantity}
                                            {item.specification.type === 'service' && item.serviceCount && 
                                              ` (${item.serviceCount} обсл.)`
                                            }
                                          </td>
                                          <td className="px-4 py-2 text-right">
                                            {formatCurrency(item.specification.price)} ₴
                                          </td>
                                          <td className="px-4 py-2 text-right">
                                            {formatCurrency(item.amount)} ₴
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr className="font-medium">
                                        <td colSpan="3" className="px-4 py-2 text-right">
                                          Загальна сума:
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                          {formatCurrency(act.totalAmount)} ₴
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )} 
              </div>
            ))}
          </div>
        </div>

        {showCreateActModal && selectedContract && (
          <CreateActModal
            isOpen={showCreateActModal}
            onClose={() => setShowCreateActModal(false)}
            contract={selectedContract}
            onSubmit={handleCreateAct}
          />
        )}
      </div>
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
