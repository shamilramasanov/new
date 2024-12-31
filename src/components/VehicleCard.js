import React from 'react';
import Link from 'next/link';

const VehicleCard = ({ vehicle }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            {vehicle.brand} {vehicle.model}
          </h1>
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
            <div>
              <span className="font-medium">Б/н:</span> {vehicle.number}
            </div>
            <div>
              <span className="font-medium">Пробіг:</span> {vehicle.mileage?.toLocaleString()} км
            </div>
            <div>
              <span className="font-medium">Рік випуску:</span> {vehicle.year}
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-4">
            <div className="mb-1">
              <span className="font-medium">VIN:</span> {vehicle.vin}
            </div>
            <div>
              <span className="font-medium">Місце дислокації:</span> {vehicle.location}
            </div>
          </div>
        </div>
        {vehicle.imageUrl && (
          <div className="ml-6">
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-48 h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
      
      <div className="flex gap-3 mt-4">
        <Link
          href={`/vehicles/${vehicle.id}/edit`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Редагувати
        </Link>
        <Link
          href={`/vehicles/${vehicle.id}/repairs`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Додати ремонт
        </Link>
        <Link
          href={`/vehicles/${vehicle.id}/mileage`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Історія пробігу
        </Link>
      </div>
    </div>
  );
};

export default VehicleCard;
