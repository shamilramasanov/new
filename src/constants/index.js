export const BUDGET_TYPES = {
  GENERAL: 'Загальний фонд',
  SPECIAL: 'Спеціальний фонд',
};

export const CONTRACT_STATUSES = {
  ACTIVE: 'Активний',
  COMPLETED: 'Завершений',
  CANCELLED: 'Скасований',
};

export const KEKV_CODES = [
  { code: '2210', name: 'Предмети, матеріали, обладнання та інвентар' },
  { code: '2240', name: 'Оплата послуг (крім комунальних)' },
  { code: '2250', name: 'Видатки на відрядження' },
  { code: '2270', name: 'Оплата комунальних послуг та енергоносіїв' },
  { code: '2282', name: 'Окремі заходи по реалізації державних (регіональних) програм' },
  { code: '3110', name: 'Придбання обладнання і предметів довгострокового користування' },
  { code: '3132', name: 'Капітальний ремонт інших об\'єктів' },
];

export const DATE_FORMAT = 'DD.MM.YYYY';

export const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};
