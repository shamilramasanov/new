import React, { useState } from 'react';
import Link from 'next/link';
import styles from './VehiclesPage.module.css';
import { formatCurrency } from '@/utils/format';

export default function VehiclesPage({ vehicles = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтруем автомобили по поисковому запросу
  const filteredVehicles = vehicles.filter(vehicle => {
    const query = searchQuery.toLowerCase();
    return (
      vehicle.brand.toLowerCase().includes(query) ||
      vehicle.number.toLowerCase().includes(query) ||
      vehicle.location?.toLowerCase().includes(query)
    );
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Реєстр автомобілів</h1>
          <p className={styles.description}>Облік автомобілів та їх ремонтів</p>
        </div>
        <div className={styles.headerButtons}>
          <Link href="/" className={styles.backButton}>
            ← Назад до кошторисів
          </Link>
          <Link
            href="/vehicles/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Додати автомобіль
          </Link>
        </div>
      </header>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Пошук за маркою, номером або місцем дислокації..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {vehicles.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            У реєстрі поки немає автомобілів.
          </p>
          <Link
            href="/vehicles/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4"
          >
            Додати перший автомобіль
          </Link>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            За вашим запитом нічого не знайдено
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredVehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/vehicles/${vehicle.id}/repairs`}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{vehicle.brand} {vehicle.model}</h2>
                <span className={styles.cardVin}>В/н: {vehicle.number}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardInfo}>
                  <span>Рік випуску:</span>
                  <span>{vehicle.year || 'Не вказано'}</span>
                </div>
                <div className={styles.cardInfo}>
                  <span>Пробіг:</span>
                  <span>{vehicle.mileage ? `${vehicle.mileage} км` : 'Не вказано'}</span>
                </div>
                <div className={styles.cardInfo}>
                  <span>Місце дислокації:</span>
                  <span>{vehicle.location || 'Не вказано'}</span>
                </div>
              </div>
              <div className={styles.cardStats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Всього ремонтів</span>
                  <span className={styles.statValue}>{vehicle.repairs?.length || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>В роботі</span>
                  <span className={styles.statValue}>
                    {vehicle.repairs?.filter(r => r.status === 'IN_PROGRESS').length || 0}
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Сума ремонтів</span>
                  <span className={styles.statValue}>
                    {formatCurrency(vehicle.repairs?.reduce((sum, r) => sum + r.amount, 0) || 0)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/vehicles`);
    if (!response.ok) {
      throw new Error('Failed to fetch vehicles');
    }
    const vehicles = await response.json();

    return {
      props: {
        vehicles,
      },
    };
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return {
      props: {
        vehicles: [],
      },
    };
  }
}
