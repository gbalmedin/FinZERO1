// Currency formatting utilities for Brazilian Real (BRL)

export const formatCurrency = (value: string | number): string => {
  if (!value && value !== 0) return "";
  
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) : value;
  
  if (isNaN(numericValue)) return "";
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

export const parseCurrencyToNumber = (value: string): number => {
  if (!value) return 0;
  
  // Remove currency symbol and spaces
  let cleanValue = value.replace(/[R$\s]/g, '');
  
  // Remove thousand separators (dots) and convert comma decimal separator to dot
  cleanValue = cleanValue
    .replace(/\./g, '') // Remove thousand separators
    .replace(',', '.'); // Convert decimal separator
  
  const numericValue = parseFloat(cleanValue);
  return isNaN(numericValue) ? 0 : numericValue;
};

export const formatCurrencyInput = (value: string): string => {
  if (!value) return "";
  
  // Remove all non-numeric characters
  let cleanValue = value.replace(/[^\d]/g, '');
  
  if (!cleanValue) return "";
  
  // Convert to number and back to ensure proper formatting
  const numericValue = parseInt(cleanValue);
  
  // Format with Brazilian locale (thousands separators and decimal places)
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue / 100); // Divide by 100 for cents
  
  return formatted;
};

export const validateCurrency = (value: string): boolean => {
  // Brazilian format: 1.234.567,89
  const regex = /^\d{1,3}(\.\d{3})*(,\d{2})?$/;
  return regex.test(value);
};

export const CURRENCY_PLACEHOLDER = "0,00";
export const CURRENCY_PATTERN = "^\\d{1,3}(\\.\\d{3})*(,\\d{2})?$";