// Comprehensive TypeScript interfaces for type safety improvements

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalInvestments: number;
  upcomingBills: UpcomingBill[];
  expensesByCategory: CategoryExpense[];
  balanceHistory: BalanceHistoryItem[];
}

export interface UpcomingBill {
  id: number;
  title: string;
  amount: string;
  dueDate: string;
  category: string;
  account: string;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  color: string;
}

export interface BalanceHistoryItem {
  month: string;
  balance: number;
}

export interface FilterValues {
  period?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom';
  startDate?: string;
  endDate?: string;
  accounts?: number[];
  categories?: number[];
  transactionTypes?: ('income' | 'expense' | 'transfer')[];
  amountRange?: {
    min?: string;
    max?: string;
  };
  status?: ('paid' | 'pending' | 'overdue')[];
}

export interface BudgetUsage {
  id: number;
  name: string;
  amount: string;
  categoryId: number;
  period: string;
  isActive: boolean;
  spent: number;
  percentage: number;
  remaining: number;
  category: CategoryInfo | null;
  isOverBudget: boolean;
  isNearLimit: boolean;
  monthTransactions: any[];
}

export interface CategoryInfo {
  id: number;
  name: string;
  color: string;
  type: 'income' | 'expense';
  icon?: string;
}

export interface AccountInfo {
  id: number;
  name: string;
  type: string;
  balance: string;
  creditLimit?: string;
  closingDay?: number;
  dueDay?: number;
  isActive: boolean;
}

export interface TransactionInfo {
  id: number;
  accountId: number;
  categoryId: number;
  title: string;
  amount: string;
  type: 'income' | 'expense' | 'transfer';
  description?: string;
  date: string;
  dueDate?: string;
  paidDate?: string;
  isPaid: boolean;
  isRecurring: boolean;
}

export interface GoalProgress {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  percentage: number;
  isCompleted: boolean;
  daysRemaining: number;
}

export interface CursorPagination {
  date: string;
  id: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    hasMore: boolean;
    cursor?: CursorPagination;
    total?: number;
  };
}

// Form data interfaces
export interface AccountFormData {
  name: string;
  type: string;
  balance: string;
  creditLimit?: string;
  closingDay?: string;
  dueDay?: string;
  isActive: boolean;
}

export interface TransactionFormData {
  accountId: string;
  categoryId: string;
  title: string;
  amount: string;
  type: 'income' | 'expense' | 'transfer';
  description?: string;
  date: string;
  dueDate?: string;
  isPaid: boolean;
  isRecurring: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
}

export interface BudgetFormData {
  categoryId: string;
  amount: string;
  period: string;
  isActive: boolean;
  description?: string;
}

export interface InvestmentFormData {
  name: string;
  type: string;
  initialAmount: string;
  currentAmount?: string;
  purchaseDate: string;
  notes?: string;
}

export interface FinancialGoalFormData {
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface UserSession {
  id: number;
  username: string;
}

export interface AuthResponse {
  user: UserSession;
}