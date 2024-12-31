export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
    timeout: 10000,
  },
  app: {
    name: 'Budget App',
    version: '1.0.0',
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
  dateFormat: 'DD.MM.YYYY',
  currency: {
    code: 'UAH',
    symbol: '₴',
    format: '0,0.00',
  },
};
