export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BalanceHistoryPoint {
  month: string;
  balance: number;
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getChartColors = (): string[] => [
  'hsl(221, 83%, 53%)',   // Primary blue
  'hsl(158, 64%, 52%)',   // Secondary green
  'hsl(38, 93%, 47%)',    // Warning yellow
  'hsl(0, 84%, 60%)',     // Accent red
  'hsl(142, 76%, 36%)',   // Success green
  'hsl(260, 100%, 80%)',  // Purple
  'hsl(25, 95%, 53%)',    // Orange
  'hsl(195, 100%, 50%)',  // Cyan
];

export const prepareExpenseChartData = (expensesByCategory: Array<{ category: string; amount: number; color: string }>): ChartDataPoint[] => {
  return expensesByCategory.map((item) => ({
    label: item.category,
    value: item.amount,
    color: item.color,
  }));
};

export const prepareBalanceChartData = (balanceHistory: Array<{ month: string; balance: number }>): BalanceHistoryPoint[] => {
  return balanceHistory.map((item) => ({
    month: item.month,
    balance: item.balance,
  }));
};
