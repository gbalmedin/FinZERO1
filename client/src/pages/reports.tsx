import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useFinancialData } from "@/hooks/use-financial-data";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { 
    transactions, 
    categories, 
    accounts, 
    budgets, 
    dashboardData,
    isLoading 
  } = useFinancialData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Relatórios e Análises</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate financial metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthTransactions = transactions?.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  }) || [];

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const previousMonthTransactions = transactions?.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === previousMonth && 
           transactionDate.getFullYear() === previousYear;
  }) || [];

  const currentIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const currentExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const previousIncome = previousMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const previousExpenses = previousMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const incomeGrowth = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
  const expenseGrowth = previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0;

  // Category analysis
  const categoryAnalysis = categories?.map(category => {
    const categoryTransactions = currentMonthTransactions.filter(t => t.categoryId === category.id);
    const amount = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const budget = budgets?.find(b => b.categoryId === category.id && b.isActive);
    const budgetAmount = budget ? parseFloat(budget.amount) : 0;
    const percentage = budgetAmount > 0 ? (amount / budgetAmount) * 100 : 0;
    
    return {
      ...category,
      amount,
      budget: budgetAmount,
      percentage,
      transactionCount: categoryTransactions.length
    };
  }).filter(c => c.amount > 0) || [];

  const handleExportPDF = () => {
    // Implementation for PDF export would go here
    // For now, we'll show a placeholder
    alert("Funcionalidade de exportação em desenvolvimento");
  };

  return (
    <div className="space-y-6 mobile-safe">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Relatórios e Análises</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportPDF} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            <span className="truncate">Exportar PDF</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Receitas do Mês
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {currentIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center text-sm mt-1 ${
              incomeGrowth >= 0 ? 'text-success' : 'text-accent'
            }`}>
              {incomeGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {Math.abs(incomeGrowth).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Despesas do Mês
              </CardTitle>
              <TrendingDown className="w-4 h-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {currentExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center text-sm mt-1 ${
              expenseGrowth <= 0 ? 'text-success' : 'text-accent'
            }`}>
              {expenseGrowth <= 0 ? (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              )}
              {Math.abs(expenseGrowth).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Saldo do Período
              </CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(currentIncome - currentExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Taxa de poupança: {currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Transações
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMonthTransactions.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {currentMonthTransactions.filter(t => t.type === 'income').length} receitas, {' '}
              {currentMonthTransactions.filter(t => t.type === 'expense').length} despesas
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Fluxo de Caixa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total de Receitas</p>
                  <p className="text-lg font-semibold text-success">
                    R$ {currentIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Crescimento</p>
                  <p className={`text-lg font-semibold ${incomeGrowth >= 0 ? 'text-success' : 'text-accent'}`}>
                    {incomeGrowth >= 0 ? '+' : ''}{incomeGrowth.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total de Despesas</p>
                  <p className="text-lg font-semibold text-accent">
                    R$ {currentExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Crescimento</p>
                  <p className={`text-lg font-semibold ${expenseGrowth <= 0 ? 'text-success' : 'text-accent'}`}>
                    {expenseGrowth >= 0 ? '+' : ''}{expenseGrowth.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Resultado Líquido</p>
                  <p className={`text-lg font-semibold ${
                    currentIncome - currentExpenses >= 0 ? 'text-success' : 'text-accent'
                  }`}>
                    R$ {(currentIncome - currentExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Taxa Poupança</p>
                  <p className="text-lg font-semibold text-primary">
                    {currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Performance por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryAnalysis.slice(0, 5).map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {category.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {category.budget > 0 && (
                        <Badge variant={category.percentage > 100 ? "destructive" : category.percentage > 80 ? "outline" : "secondary"}>
                          {category.percentage.toFixed(0)}% do orçamento
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {category.budget > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          category.percentage > 100 
                            ? 'bg-accent' 
                            : category.percentage > 80 
                            ? 'bg-warning' 
                            : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{category.transactionCount} transações</span>
                    {category.budget > 0 && (
                      <span>
                        Orçamento: R$ {category.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {categoryAnalysis.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma movimentação encontrada no período
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Resumo das Contas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts?.map((account: any) => (
              <div key={account.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{account.name}</h3>
                  <Badge variant={account.type === 'credit_card' ? 'outline' : 'secondary'}>
                    {account.type === 'credit_card' ? 'Cartão' : 
                     account.type === 'checking' ? 'Corrente' : 'Poupança'}
                  </Badge>
                </div>
                
                <p className="text-2xl font-bold">
                  R$ {parseFloat(account.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                
                {account.type === 'credit_card' && account.creditLimit && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Utilizado</span>
                      <span>
                        {((parseFloat(account.balance) / parseFloat(account.creditLimit)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-primary h-1 rounded-full"
                        style={{ 
                          width: `${Math.min((parseFloat(account.balance) / parseFloat(account.creditLimit)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
