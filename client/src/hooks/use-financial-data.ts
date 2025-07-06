import { useQuery } from "@tanstack/react-query";

// Types for the financial data
interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
  color?: string;
}

interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  categoryId: number;
  accountId: number;
  type: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
  type: string;
}

interface Budget {
  id: number;
  categoryId: number;
  amount: number;
  spent: number;
  period: string;
}

interface Investment {
  id: number;
  name: string;
  type: string;
  amount: number;
  currentValue: number;
}

interface FinancialGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalInvestments: number;
  upcomingBills: Transaction[];
  expensesByCategory: Array<{ category: string; amount: number; color: string }>;
  balanceHistory: Array<{ month: string; balance: number }>;
}

export function useFinancialData() {
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: investments = [], isLoading: investmentsLoading } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery<FinancialGoal[]>({
    queryKey: ["/api/financial-goals"],
  });

  return {
    accounts,
    categories,
    transactions,
    budgets,
    investments,
    goals,
    dashboardData: dashboardData || {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      totalInvestments: 0,
      upcomingBills: [],
      expensesByCategory: [],
      balanceHistory: []
    },
    isLoading: accountsLoading || categoriesLoading || transactionsLoading || budgetsLoading || investmentsLoading || dashboardLoading || goalsLoading,
  };
}
