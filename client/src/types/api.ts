// API Response Types for better TypeScript support

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalInvestments: number;
  upcomingBills: Transaction[];
  expensesByCategory: Array<{ category: string; amount: number; color: string }>;
  balanceHistory: Array<{ month: string; balance: number }>;
}

export interface Account {
  id: number;
  userId: number;
  name: string;
  type: string;
  balance: string | number;
  creditLimit?: string | number;
  closingDay?: number;
  dueDay?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: number;
  userId: number;
  title: string;
  amount: string | number;
  type: string;
  categoryId: number;
  accountId: number;
  description?: string;
  date: string;
  dueDate?: string;
  paidDate?: string;
  isPaid: boolean;
  isRecurring: boolean;
  recurrenceType?: string;
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  createdAt: string;
  category?: Category;
  account?: Account;
}

export interface Category {
  id: number;
  userId: number;
  name: string;
  type: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface Budget {
  id: number;
  userId: number;
  categoryId: number;
  amount: string | number;
  spent: string | number;
  period: string;
  isActive: boolean;
  createdAt: string;
  category?: Category;
}

export interface Investment {
  id: number;
  userId: number;
  name: string;
  type: string;
  institution: string;
  amount: string | number;
  expectedReturn: string | number;
  startDate: string;
  endDate?: string;
  description?: string;
  createdAt: string;
}

export interface FinancialGoal {
  id: number;
  userId: number;
  name: string;
  targetAmount: string | number;
  currentAmount: string | number;
  deadline: string;
  category: string;
  priority: string;
  description?: string;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
}

// Helper type for API responses
export type ApiResponse<T> = T | null | undefined;