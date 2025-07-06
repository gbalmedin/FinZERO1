import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar,
  CreditCard,
  Wallet,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { AdvancedFilter, FilterConfig, FilterValues } from "@/components/filters/advanced-filter";
import ModernTransactionForm from "@/components/financial/modern-transaction-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/charts";
import { getCurrentMonthFilter } from "@/lib/default-filters";
import BankLogo from "@/components/ui/bank-logo";

export default function Transactions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [filters, setFilters] = useState<FilterValues>({
    dateRange: getCurrentMonthFilter()
  });
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const { data: liquidData } = useQuery({
    queryKey: ["/api/transactions/liquid-amount", filters.dateRange],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.dateRange?.from && filters.dateRange?.to) {
        params.append('startDate', filters.dateRange.from.toISOString().split('T')[0]);
        params.append('endDate', filters.dateRange.to.toISOString().split('T')[0]);
      }
      return fetch(`/api/transactions/liquid-amount?${params.toString()}`).then(res => res.json());
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir transação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter configuration
  const filterConfig: FilterConfig = {
    showDateRange: true,
    showAmountRange: true,
    showCategories: true,
    showAccounts: true,
    showTypes: true,
    showStatus: true,
  };

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];

    let filtered = [...transactions];

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((transaction: any) =>
        transaction.title?.toLowerCase().includes(searchTerm) ||
        transaction.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply amount range filter
    if (filters.amountRange?.min !== null || filters.amountRange?.max !== null) {
      filtered = filtered.filter((transaction: any) => {
        const amount = parseFloat(transaction.amount);
        const min = filters.amountRange?.min ?? 0;
        const max = filters.amountRange?.max ?? Infinity;
        return amount >= min && amount <= max;
      });
    }

    // Apply category filter
    if (filters.categories?.length) {
      filtered = filtered.filter((transaction: any) =>
        filters.categories?.includes(transaction.categoryId?.toString())
      );
    }

    // Apply account filter
    if (filters.accounts?.length) {
      filtered = filtered.filter((transaction: any) =>
        filters.accounts?.includes(transaction.accountId?.toString())
      );
    }

    // Apply type filter
    if (filters.types?.length) {
      filtered = filtered.filter((transaction: any) =>
        filters.types?.includes(transaction.type)
      );
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "amount") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortBy === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, filters, sortBy, sortOrder]);

  // Calculate summary statistics for filtered transactions (display only)
  const filteredSummary = useMemo(() => {
    const income = filteredTransactions
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

    const expenses = filteredTransactions
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + Math.abs(parseFloat(t.amount)), 0); // Use abs for display purposes

    return { income, expenses, count: filteredTransactions.length };
  }, [filteredTransactions]);

  // Get persistent liquid amount from dedicated API endpoint
  const persistentLiquidAmount = (liquidData as any)?.liquidAmount || 0;

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
        return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
      case "expense":
        return <ArrowDownCircle className="w-4 h-4 text-red-600" />;
      default:
        return <ArrowUpCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const getCategoryName = (categoryId: number) => {
    if (!categories || !Array.isArray(categories)) return "Sem categoria";
    const category = categories.find((c: any) => c.id === categoryId);
    return category?.name || "Sem categoria";
  };

  const getAccountName = (accountId: number) => {
    if (!accounts || !Array.isArray(accounts)) return "Conta desconhecida";
    const account = accounts.find((a: any) => a.id === accountId);
    return account?.name || "Conta desconhecida";
  };

  const getAccount = (accountId: number) => {
    if (!accounts || !Array.isArray(accounts)) return null;
    return accounts.find((a: any) => a.id === accountId);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "income":
        return "Receita";
      case "expense":
        return "Despesa";
      case "transfer":
        return "Transferência";
      default:
        return type;
    }
  };

  if (transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Receitas e Despesas</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mobile-safe">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold truncate">Receitas e Despesas</h1>
          <p className="text-gray-600 text-sm">Gerencie suas transações financeiras</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          <span className="truncate">Nova Transação</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receitas (Filtradas)</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(filteredSummary.income)}
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
                <p className="text-sm font-medium text-gray-600">Despesas (Filtradas)</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(filteredSummary.expenses)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Líquido (Total)</p>
                <p className={`text-2xl font-bold ${persistentLiquidAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(persistentLiquidAmount)}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                persistentLiquidAmount >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {persistentLiquidAmount >= 0 ? 
                  <TrendingUp className="w-5 h-5 text-green-600" /> : 
                  <TrendingDown className="w-5 h-5 text-red-600" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transações (Visíveis)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredSummary.count}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <AdvancedFilter
        config={filterConfig}
        filters={filters}
        onFiltersChange={setFilters}
        categories={Array.isArray(categories) ? categories as Array<{ id: number; name: string; color: string }> : []}
        accounts={Array.isArray(accounts) ? accounts as Array<{ id: number; name: string; type: string }> : []}
        className="border-b pb-4"
      />

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="truncate">Transações ({filteredTransactions.length})</CardTitle>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="amount">Valor</SelectItem>
                  <SelectItem value="title">Título</SelectItem>
                  <SelectItem value="type">Tipo</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="flex-shrink-0"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <Download className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma transação encontrada
              </h3>
              <p className="text-gray-500 mb-6">
                {filters.searchTerm || Object.keys(filters).length > 0
                  ? "Tente ajustar os filtros para ver mais resultados."
                  : "Comece adicionando suas primeiras transações."}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Transação
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction: any) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <Badge 
                            variant={
                              transaction.type === "income" ? "default" : 
                              transaction.type === "expense" ? "destructive" : "secondary"
                            }
                          >
                            {getTypeLabel(transaction.type)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.title}</p>
                          {transaction.description && (
                            <p className="text-sm text-gray-500">{transaction.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3" />
                          {getCategoryName(transaction.categoryId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BankLogo 
                            domain={getAccount(transaction.accountId)?.domain} 
                            name={getAccountName(transaction.accountId)} 
                            size={16} 
                          />
                          {getAccountName(transaction.accountId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${
                          transaction.type === "income" ? "text-green-600" : 
                          transaction.type === "expense" ? "text-red-600" : "text-blue-600"
                        }`}>
                          {transaction.type === "expense" ? "-" : "+"}
                          {formatCurrency(parseFloat(transaction.amount))}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Editar Transação" : "Nova Transação"}
            </DialogTitle>
          </DialogHeader>
          <ModernTransactionForm
            transaction={editingTransaction}
            onSuccess={handleDialogClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}