import React from 'react';

export default function SpecificationDisplayRenderer({ specifications }) {
  if (!specifications?.length) {
    console.log('No specifications provided or empty array');
    return null;
  }

  console.log('Specifications received:', specifications);

  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0.00';
    return new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.round(num * 100) / 100);
  };

  // Группируем спецификации по автомобилям 
  const groupedSpecifications = React.useMemo(() => {
    console.log('Grouping specifications:', specifications);
    
    const grouped = specifications.reduce((acc, spec) => {
      const vehicleKey = spec.vehicleBrand && spec.vehicleVin ? 
        `${spec.vehicleBrand}-${spec.vehicleVin}` : 'default';
      
      if (!acc[vehicleKey]) {
        acc[vehicleKey] = {
          vehicleInfo: {
            brand: spec.vehicleBrand || 'Не вказано',
            vin: spec.vehicleVin || 'Не вказано',
            location: spec.vehicleLocation || 'Не вказано'
          },
          services: [],
          parts: []
        };
      }

      // Определяем тип спецификации и количество обслуживаний
      const isService = spec.unit === 'норм/год';
      const serviceCount = isService ? (spec.serviceCount || 1) : 1;
      
      // Рассчитываем сумму с учетом количества обслуживаний
      const amount = isService 
        ? spec.quantity * spec.price * serviceCount
        : spec.quantity * spec.price;

      const specWithAmount = {
        ...spec,
        isService,
        serviceCount,
        amount: Math.round(amount * 100) / 100
      };

      if (isService) {
        acc[vehicleKey].services.push(specWithAmount);
      } else {
        acc[vehicleKey].parts.push(specWithAmount);
      }
      
      return acc;
    }, {});

    console.log('Grouped specifications:', grouped);
    return grouped;
  }, [specifications]);

  // Вычисляем общую сумму
  const totalAmount = React.useMemo(() => {
    return Object.values(groupedSpecifications).reduce((total, group) => {
      const servicesTotal = group.services.reduce((sum, spec) => sum + (spec.amount || 0), 0);
      const partsTotal = group.parts.reduce((sum, spec) => sum + (spec.amount || 0), 0);
      return total + servicesTotal + partsTotal;
    }, 0);
  }, [groupedSpecifications]);

  return (
    <div className="space-y-8">
      {Object.entries(groupedSpecifications).map(([vehicleKey, group]) => (
        <div key={vehicleKey} className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {group.vehicleInfo.brand} ({group.vehicleInfo.vin})
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Місце: {group.vehicleInfo.location}
            </p>
          </div>

          {/* Услуги */}
          {group.services.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="px-4 py-3 bg-gray-50">
                <h4 className="text-md font-medium text-gray-900">Послуги</h4>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">№</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Найменування</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Од. виміру</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">К-сть</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ціна</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">К-ть обсл.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сума</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {group.services.map((spec, index) => (
                    <tr key={spec.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{spec.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{spec.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(spec.quantity)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(spec.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{spec.isService ? spec.serviceCount : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(spec.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      Разом за послуги:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatNumber(group.services.reduce((sum, spec) => sum + (spec.amount || 0), 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Запчасти */}
          {group.parts.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="px-4 py-3 bg-gray-50">
                <h4 className="text-md font-medium text-gray-900">Використані запчастини</h4>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">№</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Найменування</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Код</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Од. виміру</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">К-сть</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ціна</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">К-ть обсл.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сума</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {group.parts.map((spec, index) => (
                    <tr key={spec.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{spec.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{spec.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{spec.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(spec.quantity)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(spec.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{spec.serviceCount || 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(spec.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      Разом за запчастини:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatNumber(group.parts.reduce((sum, spec) => sum + (spec.amount || 0), 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Итого по автомобилю */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="text-right">
              <span className="font-medium text-gray-900">
                Разом по автомобілю: {formatNumber(
                  group.services.reduce((sum, spec) => sum + (spec.amount || 0), 0) +
                  group.parts.reduce((sum, spec) => sum + (spec.amount || 0), 0)
                )} грн
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Общий итог */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-6 py-4 bg-gray-50">
          <div className="text-right">
            <span className="text-lg font-medium text-gray-900">
              Загальна сума: {formatNumber(totalAmount)} грн
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
