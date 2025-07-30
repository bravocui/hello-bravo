export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatMonthYear = (year: number, month: number) => {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}; 