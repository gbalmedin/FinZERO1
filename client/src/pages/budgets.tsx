import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  PieChart,
  BarChart3
} from "lucide-react";
import { AdvancedFilter, FilterConfig, FilterValues } from "@/components/filters/advanced-filter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/charts";
import { getCurrentMonthFilter } from "@/lib/default-filters";

export default function Budgets() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [budgetType, setBudgetType] = useState<'category' | 'general'>('category');
  const [filters, setFilters] = useState<FilterValues>({
    dateRange: getCurrentMonthFilter()
  });
  const { toast } = useToast();

  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ["/api/budgets"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: goals } = useQuery({
    queryKey: ["/api/financial-goals"],
  });

  // Filter configuration
  const filterConfig: FilterConfig = {
    showCategories: true,
    showDateRange: true,
    showStatus: true,
  };

  // Calculate budget usage
  const budgetUsage = useMemo(() => {
    if (!budgets || !transactions || !Array.isArray(budgets) || !Array.isArray(transactions)) return [];

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return (budgets as any[]).map((budget: any) => {
      // Get current month transactions for this budget
      const monthTransactions = (transactions as any[]).filter((t: any) => {
        const tDate = new Date(t.date);
        return (
          t.categoryId === budget.categoryId &&
          t.type === 'expense' &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear
        );
      });

      const spent = monthTransactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
      const budgetAmount = parseFloat(budget.amount);
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
      const remaining = Math.max(budgetAmount - spent, 0);

      const category = Array.isArray(categories) ? (categories as any[]).find((c: any) => c.id === budget.categoryId) : null;

      return {
        ...budget,
        spent,
        percentage,
        remaining,
        category,
        isOverBudget: spent > budgetAmount,
        isNearLimit: percentage >= 80,
        monthTransactions
      };
    });
  }, [budgets, transactions, categories]);

  // Calculate overall budget summary
  const budgetSummary = useMemo(() => {
    const totalBudget = budgetUsage.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const totalSpent = budgetUsage.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = budgetUsage.reduce((sum, b) => sum + b.remaining, 0);
    const overBudgetCount = budgetUsage.filter(b => b.isOverBudget).length;
    const nearLimitCount = budgetUsage.filter(b => b.isNearLimit && !b.isOverBudget).length;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      overBudgetCount,
      nearLimitCount,
      overallPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };
  }, [budgetUsage]);

  // Apply filters to budget data
  const filteredBudgetUsage = useMemo(() => {
    let filtered = [...budgetUsage];

    // Filter by categories
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(budget => 
        filters.categories!.includes(budget.categoryId?.toString() || '')
      );
    }

    // Filter by status (over budget, near limit, etc.)
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(budget => {
        if (filters.status!.includes('over_budget') && budget.isOverBudget) return true;
        if (filters.status!.includes('near_limit') && budget.isNearLimit) return true;
        if (filters.status!.includes('on_track') && !budget.isOverBudget && !budget.isNearLimit) return true;
        return false;
      });
    }

    return filtered;
  }, [budgetUsage, filters]);

  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      const endpoint = editingBudget ? `/api/budgets/${editingBudget.id}` : "/api/budgets";
      const method = editingBudget ? "PUT" : "POST";
      return await apiRequest(method, endpoint, budgetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setIsDialogOpen(false);
      setEditingBudget(null);
      toast({
        title: editingBudget ? "Orçamento atualizado" : "Orçamento criado",
        description: "O orçamento foi salvo com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar orçamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({
        title: "Orçamento excluído",
        description: "O orçamento foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir orçamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setBudgetType(budget.categoryId ? 'category' : 'general');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este orçamento?")) {
      deleteBudgetMutation.mutate(id);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusIcon = (budget: any) => {
    if (budget.isOverBudget) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (budget.isNearLimit) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  if (budgetsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Orçamentos e Metas</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mobile-safe">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos e Metas</h1>
          <p className="text-gray-600">Defina e acompanhe seus orçamentos e metas financeiras</p>
        </div>
        <Button onClick={() => { setEditingBudget(null); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orçamento Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(budgetSummary.totalBudget)}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gasto Atual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(budgetSummary.totalSpent)}
                </p>
                <p className="text-sm text-gray-500">
                  {budgetSummary.overallPercentage.toFixed(1)}% do orçamento
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Restante</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(budgetSummary.totalRemaining)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas</p>
                <p className="text-2xl font-bold text-red-600">
                  {budgetSummary.overBudgetCount}
                </p>
                <p className="text-sm text-gray-500">
                  {budgetSummary.nearLimitCount} próximos do limite
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso Geral do Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {formatCurrency(budgetSummary.totalSpent)} de {formatCurrency(budgetSummary.totalBudget)}
              </span>
              <span className={`text-sm font-semibold ${
                budgetSummary.overallPercentage >= 100 ? 'text-red-600' : 
                budgetSummary.overallPercentage >= 80 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {budgetSummary.overallPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(budgetSummary.overallPercentage, 100)} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <AdvancedFilter
        config={filterConfig}
        filters={filters}
        onFiltersChange={setFilters}
        categories={Array.isArray(categories) ? categories : []}
        className="border-b pb-4"
      />

      {/* Budget List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBudgetUsage.length === 0 ? (
          <Card className="lg:col-span-2">
            <CardContent className="py-12">
              <div className="text-center">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum orçamento cadastrado
                </h3>
                <p className="text-gray-500 mb-6">
                  Comece definindo orçamentos para suas categorias de despesa.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro orçamento
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredBudgetUsage.map((budget: any) => (
            <Card key={budget.id} className={`${
              budget.isOverBudget ? 'border-red-200 bg-red-50' : 
              budget.isNearLimit ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'
            }`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(budget)}
                    <div>
                      <CardTitle className="text-lg">{budget.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {budget.category?.name || 'Orçamento geral'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(budget.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Budget Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {formatCurrency(budget.spent)} de {formatCurrency(parseFloat(budget.amount))}
                      </span>
                      <span className={`text-sm font-semibold ${
                        budget.isOverBudget ? 'text-red-600' : 
                        budget.isNearLimit ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {budget.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(budget.percentage, 100)} 
                      className="h-2"
                    />
                  </div>

                  {/* Budget Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 block">Restante</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(budget.remaining)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Período</span>
                      <span className="font-medium">Mensal</span>
                    </div>
                  </div>

                  {/* Alert Messages */}
                  {budget.isOverBudget && (
                    <div className="flex items-center gap-2 p-3 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-800">
                        Orçamento excedido em {formatCurrency(budget.spent - parseFloat(budget.amount))}
                      </span>
                    </div>
                  )}

                  {budget.isNearLimit && !budget.isOverBudget && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-100 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Próximo do limite. Restam {formatCurrency(budget.remaining)}
                      </span>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Detalhes
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <PieChart className="w-4 h-4 mr-1" />
                      Histórico
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Budget Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? "Editar Orçamento" : "Novo Orçamento"}
            </DialogTitle>
            <DialogDescription>
              {editingBudget ? "Atualize as informações do seu orçamento." : "Defina um novo orçamento para controlar seus gastos por categoria."}
            </DialogDescription>
          </DialogHeader>
          <BudgetForm
            budget={editingBudget}
            categories={Array.isArray(categories) ? categories : []}
            onSubmit={(data) => createBudgetMutation.mutate(data)}
            onCancel={() => setIsDialogOpen(false)}
            isLoading={createBudgetMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface BudgetFormProps {
  budget?: any;
  categories: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function BudgetForm({ budget, categories, onSubmit, onCancel, isLoading }: BudgetFormProps) {
  const [formData, setFormData] = useState({
    name: budget?.name || "",
    amount: budget?.amount || "",
    categoryId: budget?.categoryId ? budget.categoryId.toString() : "general",
    period: budget?.period || "monthly",
    isActive: budget?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount) {
      return;
    }

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      categoryId: formData.categoryId && formData.categoryId !== "general" ? parseInt(formData.categoryId) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Orçamento</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Alimentação, Transporte..."
          required
        />
      </div>

      <div>
        <Label htmlFor="categoryId">Categoria (opcional)</Label>
        <Select 
          value={formData.categoryId} 
          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">Orçamento geral</SelectItem>
            {categories?.filter((c: any) => c.type === 'expense').map((category: any) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Valor do Orçamento</Label>
        <CurrencyInput
          id="amount"
          value={formData.amount}
          onChange={(value) => setFormData({ ...formData, amount: value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="period">Período</Label>
        <Select 
          value={formData.period} 
          onValueChange={(value) => setFormData({ ...formData, period: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : budget ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}