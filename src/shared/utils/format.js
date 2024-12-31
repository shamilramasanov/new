import { config } from '../../core/config';

export const formatMoney = (amount) => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' грн';
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export function formatNumber(number, minimumFractionDigits = 2) {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  }).format(number);
}
