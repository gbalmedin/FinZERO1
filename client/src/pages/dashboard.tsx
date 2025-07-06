import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import KpiCard from "@/components/financial/kpi-card";
import ExpenseChart from "@/components/charts/expense-chart";
import BalanceChart from "@/components/charts/balance-chart";
import DashboardFilter, { DashboardFilterValues } from "@/components/filters/dashboard-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  ChartLine, 
  CreditCard, 
  Home, 
  Car,
  Plus,
  Minus,
  CheckCircle,
  TriangleAlert,
  AlertTriangle,
  Bell,
  Target,
  DollarSign,
  Activity
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { getCurrentMonthFilter } from "@/lib/default-filters";
import BankLogo from "@/components/ui/bank-logo";

const getDefaultFilters = (): DashboardFilterValues => {
  const currentMonth = getCurrentMonthFilter();
  
  return {
    dateRange: {
      startDate: currentMonth.from.toISOString().split('T')[0],
      endDate: currentMonth.to.toISOString().split('T')[0],
      period: 'thismonth'
    },
    accounts: [],
    categories: [],
    transactionTypes: [],
    amountRange: { min: '', max: '' },
    includeInvestments: true,
    includeBudgets: true,
    includeGoals: true,
  };
};

// Calculate balance trend compared to previous month
const calculateBalanceTrend = (data: any) => {
  if (!data || !data.balanceHistory || data.balanceHistory.length < 2) {
    return undefined;
  }
  
  const currentBalance = data.totalBalance || 0;
  const previousBalance = data.balanceHistory[data.balanceHistory.length - 2]?.balance || 0;
  
  if (previousBalance === 0) return undefined;
  
  const change = ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100;
  return {
    value: Math.abs(change).toFixed(1),
    isPositive: change >= 0,
    suffix: "vs mês anterior"
  };
};

// Calculate income goal achievement
const calculateIncomeGoalBadge = (data: any) => {
  const income = Math.abs(data?.monthlyIncome || 0);
  const goal = data?.monthlyIncomeGoal || 0;
  
  if (income === 0 || goal === 0) return undefined;
  
  const percentage = (income / goal) * 100;
  
  if (percentage >= 100) return "Meta atingida";
  if (percentage >= 80) return `${percentage.toFixed(0)}% da meta`;
  if (percentage >= 50) return `${percentage.toFixed(0)}% da meta`;
  return `${percentage.toFixed(0)}% da meta`;
};

const getIncomeGoalBadgeVariant = (data: any) => {
  const income = Math.abs(data?.monthlyIncome || 0);
  const goal = data?.monthlyIncomeGoal || 0;
  
  if (income === 0 || goal === 0) return "secondary";
  
  const percentage = (income / goal) * 100;
  
  if (percentage >= 100) return "success";
  if (percentage >= 80) return "default";
  return "warning";
};

// Calculate budget usage
const calculateBudgetUsageBadge = (data: any) => {
  const expenses = Math.abs(data?.monthlyExpenses || 0);
  const budget = data?.monthlyBudgetLimit || 0;
  
  if (expenses === 0 || budget === 0) return undefined;
  
  const percentage = (expenses / budget) * 100;
  
  if (percentage > 100) return `${percentage.toFixed(0)}% do orçamento`;
  if (percentage >= 90) return `${percentage.toFixed(0)}% do orçamento`;
  if (percentage >= 70) return `${percentage.toFixed(0)}% do orçamento`;
  return `${percentage.toFixed(0)}% do orçamento`;
};

const getBudgetUsageBadgeVariant = (data: any) => {
  const expenses = Math.abs(data?.monthlyExpenses || 0);
  const budget = data?.monthlyBudgetLimit || 0;
  
  if (expenses === 0 || budget === 0) return "secondary";
  
  const percentage = (expenses / budget) * 100;
  
  if (percentage > 100) return "destructive";
  if (percentage >= 90) return "warning";
  return "default";
};

// Calculate investment performance
const calculateInvestmentTrend = (data: any) => {
  const totalInvestments = data?.totalInvestments || 0;
  if (totalInvestments === 0) return undefined;
  
  // Calculate based on historical investment data if available
  // For now, we'll only show if we have actual investment data
  const investmentGrowth = data?.investmentGrowthRate || 0;
  if (investmentGrowth === 0) return undefined;
  
  return {
    value: Math.abs(investmentGrowth).toFixed(1),
    isPositive: investmentGrowth >= 0,
    suffix: "% a.a."
  };
};

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilterValues>(getDefaultFilters());
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [filteredData, setFilteredData] = useState<any>(null);

  // Default dashboard data
  const { data: dashboardData, isLoading: defaultDataLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  // Filtered dashboard data
  const filteredDataMutation = useMutation({
    mutationFn: async (filterValues: DashboardFilterValues) => {
      const response = await apiRequest('POST', '/api/dashboard/filtered', filterValues);
      return response.json();
    },
    onSuccess: (data) => {
      setFilteredData(data);
    }
  });

  // Check if filters are applied (different from default)
  const hasActiveFilters = () => {
    const defaultFilters = getDefaultFilters();
    return (
      filters.accounts.length > 0 ||
      filters.categories.length > 0 ||
      filters.transactionTypes.length > 0 ||
      filters.amountRange.min !== '' ||
      filters.amountRange.max !== '' ||
      filters.dateRange.period !== 'last30days' ||
      !filters.includeInvestments ||
      !filters.includeBudgets ||
      !filters.includeGoals
    );
  };

  // Update filtered data when filters change
  useEffect(() => {
    if (hasActiveFilters()) {
      filteredDataMutation.mutate(filters);
    } else {
      setFilteredData(null);
    }
  }, [filters]);

  const handleFiltersChange = (newFilters: DashboardFilterValues) => {
    setFilters(newFilters);
  };

  // Use filtered data if available, otherwise use default data
  const currentData = filteredData || dashboardData;
  const isLoading = defaultDataLoading || filteredDataMutation.isPending;
  
  const { recentAlerts, unreadCount, markAsRead } = useNotifications();

  if (isLoading) {
    return (
      <div className="space-y-6 mobile-safe">
        {/* Filter Component - Collapsed */}
        <DashboardFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isCollapsed={true}
          onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="space-y-6 mobile-safe">
        {/* Filter Component */}
        <DashboardFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isCollapsed={isFilterCollapsed}
          onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
        />
        
        <div className="text-center py-8">
          <p className="text-gray-500">Erro ao carregar dados do dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mobile-safe">
      {/* Filter Component */}
      <DashboardFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isCollapsed={isFilterCollapsed}
        onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Saldo Total"
          value={`R$ ${((currentData as any)?.totalBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<Wallet className="w-6 h-6" />}
          trend={calculateBalanceTrend(currentData)}
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        
        <KpiCard
          title="Receitas do Mês"
          value={`R$ ${Math.abs((currentData as any)?.monthlyIncome || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-6 h-6" />}
          badge={calculateIncomeGoalBadge(currentData)}
          badgeVariant={getIncomeGoalBadgeVariant(currentData)}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        
        <KpiCard
          title="Despesas do Mês"
          value={`R$ ${Math.abs((currentData as any)?.monthlyExpenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingDown className="w-6 h-6" />}
          badge={calculateBudgetUsageBadge(currentData)}
          badgeVariant={getBudgetUsageBadgeVariant(currentData)}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        
        <KpiCard
          title="Investimentos"
          value={`R$ ${((currentData as any)?.totalInvestments || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<ChartLine className="w-6 h-6" />}
          trend={calculateInvestmentTrend(currentData)}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart data={(currentData as any)?.expensesByCategory || []} />
        <BalanceChart data={(currentData as any)?.balanceHistory || []} />
      </div>

      {/* Upcoming Bills and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bills */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Próximos Vencimentos</CardTitle>
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {((currentData as any)?.upcomingBills || []).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum vencimento próximo
                  </p>
                ) : (
                  ((currentData as any)?.upcomingBills || []).map((bill: any) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{bill.title}</p>
                          <p className="text-sm text-gray-600">
                            {bill.dueDate ? `Vence em ${Math.ceil((new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias` : 'Sem data de vencimento'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          R$ {parseFloat(bill.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          Pendente
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Health */}
          <Card>
            <CardHeader>
              <CardTitle>Saúde Financeira</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reserva de Emergência</span>
                  <span className="text-sm font-medium text-success">6 meses</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Endividamento</span>
                  <span className="text-sm font-medium text-success">12%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Alertas Recentes
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/settings">Ver todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Nenhum alerta no momento</p>
                    <p className="text-xs text-gray-500">Tudo funcionando perfeitamente!</p>
                  </div>
                ) : (
                  recentAlerts.map((alert) => {
                    const getAlertIcon = () => {
                      switch (alert.type) {
                        case 'error':
                          return <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />;
                        case 'warning':
                          return <TriangleAlert className="w-4 h-4 text-yellow-500 mt-0.5" />;
                        case 'success':
                          return <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />;
                        case 'info':
                        default:
                          return <Bell className="w-4 h-4 text-blue-500 mt-0.5" />;
                      }
                    };

                    const getAlertBg = () => {
                      switch (alert.type) {
                        case 'error':
                          return 'bg-red-50 border-l-red-500';
                        case 'warning':
                          return 'bg-yellow-50 border-l-yellow-500';
                        case 'success':
                          return 'bg-green-50 border-l-green-500';
                        case 'info':
                        default:
                          return 'bg-blue-50 border-l-blue-500';
                      }
                    };

                    return (
                      <div 
                        key={alert.id} 
                        className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 ${getAlertBg()} ${
                          !alert.isRead ? 'ring-1 ring-blue-200' : ''
                        } cursor-pointer hover:bg-opacity-75 transition-colors`}
                        onClick={() => {
                          markAsRead(alert.id);
                          if (alert.actionUrl) {
                            window.location.href = alert.actionUrl;
                          }
                        }}
                      >
                        {getAlertIcon()}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {alert.title}
                            </p>
                            <span className="text-xs text-gray-500 ml-2">
                              {alert.timestamp.toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                alert.priority === 'high' ? 'border-red-200 text-red-700' :
                                alert.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                                'border-gray-200 text-gray-600'
                              }`}
                            >
                              {alert.category === 'budget' ? 'Orçamento' :
                               alert.category === 'account' ? 'Conta' :
                               alert.category === 'investment' ? 'Investimento' :
                               alert.category === 'goal' ? 'Meta' :
                               alert.category === 'transaction' ? 'Transação' :
                               'Sistema'}
                            </Badge>
                            {!alert.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
