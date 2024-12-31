// Конфигурация типов договоров
export const CONTRACT_TYPES = {
  'DIRECT': {
    name: 'Прямий',
    color: '#047857', // зеленый
    bgColor: '#ECFDF5',
  },
  'URGENT': {
    name: 'Нагальна потреба',
    color: '#B45309', // оранжевый
    bgColor: '#FEF3C7',
  },
  'TENDER': {
    name: 'Відкриті торги',
    color: '#1D4ED8', // синий
    bgColor: '#EFF6FF',
  },
  'INSURANCE': {
    name: 'Страхування',
    color: '#7C3AED', // фиолетовый
    bgColor: '#F5F3FF',
  },
};

// Получить цвета для типа договора
export const getContractTypeColors = (type) => {
  return CONTRACT_TYPES[type] || {
    color: '#4B5563', // серый по умолчанию
    bgColor: '#F3F4F6',
  };
};

// Получить украинское название типа договора
export const getContractTypeName = (type) => {
  return CONTRACT_TYPES[type]?.name || type;
};
