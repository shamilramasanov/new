import React from 'react';

export default function SpecificationUploadRenderer({ loading }) {
  if (!loading) return null;

  return (
    <div className="animate-pulse space-y-6">
      {/* Имитация карточки автомобиля */}
      <div className="border rounded-lg overflow-hidden">
        {/* Заголовок */}
        <div className="bg-gray-200 h-10 rounded-t"></div>
        
        {/* Услуги */}
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>

        {/* Запчасти */}
        <div className="p-4 space-y-3 border-t">
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>

        {/* Итого */}
        <div className="bg-gray-200 h-10 rounded-b"></div>
      </div>
    </div>
  );
}
