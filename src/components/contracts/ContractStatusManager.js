import { useState } from 'react';

const CONTRACT_STATUSES = [
  { value: 'PLANNED', label: 'Заплановано' },
  { value: 'DRAFT', label: 'Чернетка' },
  { value: 'ACTIVE', label: 'Активний' },
  { value: 'COMPLETED', label: 'Завершено' },
  { value: 'TERMINATED', label: 'Розірвано' }
];

export default function ContractStatusManager({ 
  contract, 
  onStatusChange,
  onSave 
}) {
  const [status, setStatus] = useState(contract.status);
  const [number, setNumber] = useState(contract.number || '');
  const [startDate, setStartDate] = useState(
    contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : ''
  );
  const [error, setError] = useState(null);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  const handleSave = async () => {
    // Валидация при активации договора
    if (status === 'ACTIVE') {
      if (!number || !startDate || !endDate) {
        setError('Для активації договору необхідно заповнити номер та дати');
        return;
      }
    }

    setError(null);
    
    if (onSave) {
      await onSave({
        status,
        ...(status === 'ACTIVE' && {
          number,
          startDate,
          endDate
        })
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Статус договору
          </label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {CONTRACT_STATUSES.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Поля для активного статуса */}
      {status === 'ACTIVE' && (
        <div className="space-y-4 border-t pt-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Номер договору
            </label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Дата початку
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Дата закінчення
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Зберегти зміни
        </button>
      </div>
    </div>
  );
}
