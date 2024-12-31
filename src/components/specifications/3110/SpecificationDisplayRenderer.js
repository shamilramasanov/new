import React from 'react';

export default function SpecificationDisplayRenderer({ specifications }) {
  if (!specifications?.length) return null;

  const formatNumber = (num) => {
    return new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Найменування</th>
              <th className="px-4 py-2 text-right">Кількість</th>
              <th className="px-4 py-2 text-right">Од. вим.</th>
              <th className="px-4 py-2 text-right">Ціна</th>
              <th className="px-4 py-2 text-right">Сума</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {specifications.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2 text-right">{formatNumber(item.quantity)}</td>
                <td className="px-4 py-2 text-right">{item.unit}</td>
                <td className="px-4 py-2 text-right">
                  {formatNumber(item.priceWithoutVAT)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatNumber(item.totalWithoutVAT)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="px-4 py-2 text-right font-medium">
                Загальна сума:
              </td>
              <td className="px-4 py-2 text-right font-medium">
                {formatNumber(
                  specifications.reduce(
                    (sum, item) => sum + item.totalWithoutVAT,
                    0
                  )
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
