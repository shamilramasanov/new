import { useState } from 'react';

export default function DkCodeAutocomplete({ value, onChange, className = '' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Актуальные коды ДК для автомобильной сферы
  const dkCodes = [
    { code: '34300000-0', name: 'Частини та приладдя до транспортних засобів і їх двигунів' },
    { code: '34310000-3', name: 'Двигуни та частини двигунів' },
    { code: '34320000-6', name: 'Механічні запасні частини, крім двигунів і частин двигунів' },
    { code: '34330000-9', name: 'Запасні частини до вантажних транспортних засобів, фургонів та легкових автомобілів' },
    { code: '34350000-5', name: 'Шини для транспортних засобів великої та малої тоннажності' },
    { code: '50110000-9', name: 'Послуги з ремонту і технічного обслуговування мототранспортних засобів і супутнього обладнання' },
    { code: '50111000-6', name: 'Послуги з управління автотранспортним парком, його ремонту та технічного обслуговування' },
    { code: '50112000-3', name: 'Послуги з ремонту і технічного обслуговування автомобілів' },
    { code: '50113000-0', name: 'Послуги з ремонту і технічного обслуговування автобусів' },
    { code: '50114000-7', name: 'Послуги з ремонту і технічного обслуговування вантажних автомобілів' },
    { code: '50116000-1', name: 'Послуги з ремонту і технічного обслуговування окремих частин транспортних засобів' },
    { code: '66514110-0', name: 'Послуги зі страхування транспортних засобів' },
    { code: '66516100-1', name: 'Послуги зі страхування цивільної відповідальності власників автотранспорту' },
    { code: '09130000-9', name: 'Нафта і дистиляти (паливо)' },
    { code: '09132000-3', name: 'Бензин' },
    { code: '09134000-7', name: 'Газойлі (дизельне паливо)' },
    { code: '31610000-5', name: 'Електричне обладнання для двигунів і транспортних засобів' },
    { code: '31620000-8', name: 'Звукове та візуальне сигнальне обладнання для транспортних засобів' },
    { code: '34370000-1', name: 'Сидіння до автотранспорту' },
    { code: '39831500-1', name: 'Автомобільні очисні засоби' }
  ];

  const filteredCodes = query === '' 
    ? [] 
    : dkCodes.filter(item => 
        item.code.toLowerCase().includes(query.toLowerCase()) ||
        item.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

  const handleSelect = (item) => {
    onChange(item);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={value ? `${value.code} - ${value.name}` : "Почніть вводити код або назву..."}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />

      {isOpen && filteredCodes.length > 0 && (
        <div 
          className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
            {filteredCodes.map((item) => (
              <li
                key={item.code}
                className="relative cursor-pointer select-none py-2 px-3 hover:bg-blue-50"
                onClick={() => handleSelect(item)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{item.code}</span>
                  <span className="text-sm text-gray-500">{item.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
