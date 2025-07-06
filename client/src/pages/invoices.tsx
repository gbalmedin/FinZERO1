import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  Calendar, 
  FileText, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  PieChart,
  TrendingUp,
  ShoppingCart,
  Receipt
} from "lucide-react";
import { AdvancedFilter, FilterConfig, FilterValues } from "@/components/filters/advanced-filter";
import { formatCurrency } from "@/lib/charts";
import { getCurrentMonthFilter } from "@/lib/default-filters";

// Calculate invoice variation compared to average
const calculateInvoiceVariation = (selectedInvoice: any, allInvoices: any[]) => {
  if (!selectedInvoice || !allInvoices.length) return "N/A";
  
  const cardInvoices = allInvoices.filter(inv => inv.cardId === selectedInvoice.cardId);
  if (cardInvoices.length < 2) return "N/A";
  
  const average = cardInvoices.reduce((sum, inv) => sum + inv.amount, 0) / cardInvoices.length;
  const variation = ((selectedInvoice.amount - average) / average) * 100;
  
  if (Math.abs(variation) < 1) return "0%";
  
  return `${variation >= 0 ? '+' : ''}${variation.toFixed(0)}%`;
};

export default function Invoices() {
  const [filters, setFilters] = useState<FilterValues>({
    dateRange: getCurrentMonthFilter()
  });
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);

  const { data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Filter configuration for invoices
  const filterConfig: FilterConfig = {
    showDateRange: true,
    showAccounts: true,
    showStatus: true,
  };

  // Get credit cards only
  const creditCards = (accounts as any[])?.filter((account: any) => account.type === 'credit_card') || [];

  // Generate mock invoice data based on credit card transactions
  const invoices = useMemo(() => {
    if (!transactions || !creditCards.length) return [];

    const mockInvoices: any[] = [];
    const currentDate = new Date();

    creditCards.forEach((card: any) => {
      // Generate invoices for the last 6 months
      for (let i = 0; i < 6; i++) {
        const invoiceDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, card.closingDay || 15);
        const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, card.dueDay || 10);
        
        // Calculate invoice amount based on transactions
        const cardTransactions = (transactions as any[])?.filter((t: any) => 
          t.accountId === card.id && 
          t.type === 'expense' &&
          new Date(t.date).getMonth() === invoiceDate.getMonth() &&
          new Date(t.date).getFullYear() === invoiceDate.getFullYear()
        ) || [];

        const amount = cardTransactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
        
        if (amount > 0) {
          const isPaid = i > 1; // Last 2 months are paid
          const isOverdue = dueDate < currentDate && !isPaid;
          const status = isPaid ? 'paid' : isOverdue ? 'overdue' : dueDate < currentDate ? 'due' : 'pending';

          mockInvoices.push({
            id: `${card.id}-${invoiceDate.getTime()}`,
            cardId: card.id,
            cardName: card.name,
            amount,
            invoiceDate: invoiceDate.toISOString(),
            dueDate: dueDate.toISOString(),
            status,
            transactions: cardTransactions,
            isPaid,
            isOverdue
          });
        }
      }
    });

    return mockInvoices.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [transactions, creditCards]);

  // Apply filters
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    if (filters.accounts?.length) {
      filtered = filtered.filter((invoice: any) =>
        filters.accounts?.includes(invoice.cardId.toString())
      );
    }

    if (filters.status?.length) {
      filtered = filtered.filter((invoice: any) =>
        filters.status?.includes(invoice.status)
      );
    }

    return filtered;
  }, [invoices, filters]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const pending = filteredInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
    const due = filteredInvoices.filter(i => i.status === 'due').reduce((sum, i) => sum + i.amount, 0);
    const overdue = filteredInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
    const paid = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

    return { pending, due, overdue, paid };
  }, [filteredInvoices]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Paga</Badge>;
      case 'due':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Vence hoje</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" />Em atraso</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Calendar className="w-3 h-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const groupedInvoices = useMemo(() => {
    return filteredInvoices.reduce((groups: any, invoice: any) => {
      if (!groups[invoice.status]) {
        groups[invoice.status] = [];
      }
      groups[invoice.status].push(invoice);
      return groups;
    }, {});
  }, [filteredInvoices]);

  return (
    <div className="space-y-6 mobile-safe">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Faturas de Cartão</h1>
          <p className="text-gray-600 text-sm sm:text-base">Acompanhe e gerencie suas faturas de cartão de crédito</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faturas Pendentes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary.pending)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencendo Hoje</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(summary.due)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.overdue)}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagas este Mês</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.paid)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <AdvancedFilter
        config={filterConfig}
        filters={filters}
        onFiltersChange={setFilters}
        accounts={creditCards}
        className="border-b pb-4"
      />

      {/* Invoices by Status */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todas ({filteredInvoices.length})</TabsTrigger>
          <TabsTrigger value="overdue">Em Atraso ({groupedInvoices.overdue?.length || 0})</TabsTrigger>
          <TabsTrigger value="due">Vencendo ({groupedInvoices.due?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending">Pendentes ({groupedInvoices.pending?.length || 0})</TabsTrigger>
          <TabsTrigger value="paid">Pagas ({groupedInvoices.paid?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <InvoiceTable invoices={filteredInvoices} getStatusBadge={getStatusBadge} />
        </TabsContent>

        <TabsContent value="overdue">
          <InvoiceTable invoices={groupedInvoices.overdue || []} getStatusBadge={getStatusBadge} />
        </TabsContent>

        <TabsContent value="due">
          <InvoiceTable invoices={groupedInvoices.due || []} getStatusBadge={getStatusBadge} />
        </TabsContent>

        <TabsContent value="pending">
          <InvoiceTable invoices={groupedInvoices.pending || []} getStatusBadge={getStatusBadge} />
        </TabsContent>

        <TabsContent value="paid">
          <InvoiceTable invoices={groupedInvoices.paid || []} getStatusBadge={getStatusBadge} />
        </TabsContent>
      </Tabs>

      {/* Invoice Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Detalhes da Fatura
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Cartão</div>
                    <div className="font-semibold">{selectedInvoice.cardName}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Valor Total</div>
                    <div className="font-semibold text-lg">{formatCurrency(selectedInvoice.amount)}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Vencimento</div>
                    <div className="font-semibold">{selectedInvoice.dueDate}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant={selectedInvoice.status === 'paid' ? 'secondary' : selectedInvoice.status === 'overdue' ? 'destructive' : 'default'}>
                      {selectedInvoice.statusText}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transações da Fatura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((_, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <div className="font-medium">Compra no Estabelecimento {i + 1}</div>
                          <div className="text-sm text-muted-foreground">15/01/2025</div>
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(Math.random() * 200 + 50)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Analysis Dialog */}
      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Análise da Fatura
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">vs. Média</div>
                        <div className="font-semibold text-green-600">
                          {calculateInvoiceVariation(selectedInvoice, invoices)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Transações</div>
                        <div className="font-semibold">{selectedInvoice.transactions?.length || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Maior Categoria</div>
                        <div className="font-semibold">Supermercado</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Gastos por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Supermercado', 'Combustível', 'Restaurantes', 'Farmácia'].map((category, i) => {
                      const percentage = [45, 25, 20, 10][i];
                      const amount = [680, 380, 300, 150][i];
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{category}</span>
                            <span className="font-semibold">{formatCurrency(amount)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface InvoiceTableProps {
  invoices: any[];
  getStatusBadge: (status: string) => JSX.Element;
}

function InvoiceTable({ invoices, getStatusBadge }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma fatura encontrada
            </h3>
            <p className="text-gray-500">
              Não há faturas para mostrar com os filtros aplicados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturas ({invoices.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cartão</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice: any) => (
                <TableRow key={invoice.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">{invoice.cardName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.invoiceDate).toLocaleDateString('pt-BR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-lg">
                      {formatCurrency(invoice.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsAnalysisDialogOpen(true);
                        }}
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}