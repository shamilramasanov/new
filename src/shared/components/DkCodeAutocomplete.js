import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

export function DkCodeAutocomplete({ value, onChange }) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDkCodes = async () => {
      if (!query || query.length < 2) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/dk-codes?search=${encodeURIComponent(query)}`);
        const data = await response.json();
        setOptions(data);
      } catch (error) {
        console.error('Error fetching DK codes:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchDkCodes, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const filteredOptions = query === ''
    ? options
    : options.filter((option) =>
        option.code.toLowerCase().includes(query.toLowerCase()) ||
        option.name.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <Combobox value={value} onChange={onChange}>
      <div className="relative mt-1">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
          <Combobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
            displayValue={(item) => item ? `${item.code} - ${item.name}` : ''}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Почніть вводити код або назву..."
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
          {loading && (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
              Завантаження...
            </div>
          )}
          {!loading && filteredOptions.length === 0 && query !== '' && (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
              Нічого не знайдено.
            </div>
          )}
          {filteredOptions.map((option) => (
            <Combobox.Option
              key={option.code}
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                  active ? 'bg-blue-600 text-white' : 'text-gray-900'
                }`
              }
              value={option}
            >
              {({ selected, active }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                    {option.code} - {option.name}
                  </span>
                  {selected ? (
                    <span
                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                        active ? 'text-white' : 'text-blue-600'
                      }`}
                    >
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}
