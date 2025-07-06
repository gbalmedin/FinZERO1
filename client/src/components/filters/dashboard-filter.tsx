import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, CalendarDays, Filter, X, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DashboardFilterValues {
  dateRange: {
    startDate: string;
    endDate: string;
    period: 'custom' | 'last7days' | 'last30days' | 'last3months' | 'last6months' | 'lastyear' | 'thismonth' | 'thisyear';
  };
  accounts: number[];
  categories: number[];
  transactionTypes: ('income' | 'expense')[];
  amountRange: {
    min: string;
    max: string;
  };
  includeInvestments: boolean;
  includeBudgets: boolean;
  includeGoals: boolean;
}

interface DashboardFilterProps {
  filters: DashboardFilterValues;
  onFiltersChange: (filters: DashboardFilterValues) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const predefinedPeriods = [
  { value: 'last7days', label: 'Últimos 7 dias' },
  { value: 'last30days', label: 'Últimos 30 dias' },
  { value: 'thismonth', label: 'Este mês' },
  { value: 'last3months', label: 'Últimos 3 meses' },
  { value: 'last6months', label: 'Últimos 6 meses' },
  { value: 'thisyear', label: 'Este ano' },
  { value: 'lastyear', label: 'Ano passado' },
  { value: 'custom', label: 'Período personalizado' },
];

const getDateRange = (period: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'last7days':
      return {
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    case 'last30days':
      return {
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    case 'thismonth':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    case 'last3months':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    case 'last6months':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    case 'thisyear':
      return {
        startDate: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    case 'lastyear':
      return {
        startDate: new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0],
        endDate: new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0]
      };
    default:
      return {
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
  }
};

export default function DashboardFilter({ 
  filters, 
  onFiltersChange, 
  isCollapsed = false, 
  onToggleCollapse 
}: DashboardFilterProps) {
  const { data: accounts } = useQuery({ queryKey: ["/api/accounts"] });
  const { data: categories } = useQuery({ queryKey: ["/api/categories"] });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const updateFilters = (updates: Partial<DashboardFilterValues>) => {
    const newFilters = { ...filters, ...updates };
    onFiltersChange(newFilters);
    
    // Count active filters
    let count = 0;
    if (newFilters.accounts.length > 0) count++;
    if (newFilters.categories.length > 0) count++;
    if (newFilters.transactionTypes.length > 0 && newFilters.transactionTypes.length < 2) count++;
    if (newFilters.amountRange.min || newFilters.amountRange.max) count++;
    if (newFilters.dateRange.period !== 'last30days') count++;
    setActiveFiltersCount(count);
  };

  const handlePeriodChange = (period: string) => {
    const dateRange = period === 'custom' 
      ? { ...filters.dateRange, period: period as any }
      : { ...getDateRange(period), period: period as any };
    
    updateFilters({ dateRange });
  };

  const handleAccountToggle = (accountId: number) => {
    const newAccounts = filters.accounts.includes(accountId)
      ? filters.accounts.filter(id => id !== accountId)
      : [...filters.accounts, accountId];
    updateFilters({ accounts: newAccounts });
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    updateFilters({ categories: newCategories });
  };

  const handleTransactionTypeToggle = (type: 'income' | 'expense') => {
    const newTypes = filters.transactionTypes.includes(type)
      ? filters.transactionTypes.filter(t => t !== type)
      : [...filters.transactionTypes, type];
    updateFilters({ transactionTypes: newTypes });
  };

  const resetFilters = () => {
    const defaultFilters: DashboardFilterValues = {
      dateRange: {
        ...getDateRange('last30days'),
        period: 'last30days'
      },
      accounts: [],
      categories: [],
      transactionTypes: [],
      amountRange: { min: '', max: '' },
      includeInvestments: true,
      includeBudgets: true,
      includeGoals: true,
    };
    onFiltersChange(defaultFilters);
    setActiveFiltersCount(0);
  };

  if (isCollapsed) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCollapse}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros do Dashboard
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              disabled={activeFiltersCount === 0}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Limpar
            </Button>
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Período */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Período
          </Label>
          <Select value={filters.dateRange.period} onValueChange={handlePeriodChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {predefinedPeriods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filters.dateRange.period === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Data início</Label>
                <Input
                  type="date"
                  value={filters.dateRange.startDate}
                  onChange={(e) => updateFilters({
                    dateRange: { ...filters.dateRange, startDate: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Data fim</Label>
                <Input
                  type="date"
                  value={filters.dateRange.endDate}
                  onChange={(e) => updateFilters({
                    dateRange: { ...filters.dateRange, endDate: e.target.value }
                  })}
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Tipos de Transação */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipos de Transação</Label>
          <div className="flex gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="income"
                checked={filters.transactionTypes?.includes('income') || false}
                onCheckedChange={() => handleTransactionTypeToggle('income')}
              />
              <Label htmlFor="income" className="text-sm flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Receitas
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="expense"
                checked={filters.transactionTypes?.includes('expense') || false}
                onCheckedChange={() => handleTransactionTypeToggle('expense')}
              />
              <Label htmlFor="expense" className="text-sm flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-red-600" />
                Despesas
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Contas */}
        {accounts && Array.isArray(accounts) && accounts.length > 0 && (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Contas</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 sm:max-h-48 overflow-y-auto">
                {(accounts as any[]).map((account: any) => (
                  <div key={account.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`account-${account.id}`}
                      checked={filters.accounts.includes(account.id)}
                      onCheckedChange={() => handleAccountToggle(account.id)}
                    />
                    <Label 
                      htmlFor={`account-${account.id}`} 
                      className="text-sm truncate"
                      title={account.name}
                    >
                      {account.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Categorias */}
        {categories && (categories as any[]).length > 0 && (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Categorias</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 sm:max-h-48 overflow-y-auto">
                {(categories as any[]).map((category: any) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <Label 
                      htmlFor={`category-${category.id}`} 
                      className="text-sm truncate flex items-center gap-1"
                      title={category.name}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Faixa de Valores */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Faixa de Valores (R$)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Valor mínimo</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={filters.amountRange.min}
                onChange={(e) => updateFilters({
                  amountRange: { ...filters.amountRange, min: e.target.value }
                })}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Valor máximo</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="10000,00"
                value={filters.amountRange.max}
                onChange={(e) => updateFilters({
                  amountRange: { ...filters.amountRange, max: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Incluir nos Cálculos */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Incluir nos Cálculos</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeInvestments"
                checked={filters.includeInvestments}
                onCheckedChange={(checked) => updateFilters({ includeInvestments: !!checked })}
              />
              <Label htmlFor="includeInvestments" className="text-sm">
                Investimentos
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeBudgets"
                checked={filters.includeBudgets}
                onCheckedChange={(checked) => updateFilters({ includeBudgets: !!checked })}
              />
              <Label htmlFor="includeBudgets" className="text-sm">
                Orçamentos
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeGoals"
                checked={filters.includeGoals}
                onCheckedChange={(checked) => updateFilters({ includeGoals: !!checked })}
              />
              <Label htmlFor="includeGoals" className="text-sm">
                Metas Financeiras
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}