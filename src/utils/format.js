export const formatCurrency = (amount) => {
  const formatter = new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${formatter.format(amount)} ₴`;
};
