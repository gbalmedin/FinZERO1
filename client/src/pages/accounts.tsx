import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus, CreditCard, Wallet, Edit, Trash2, Building2, Calendar, AlertTriangle, TrendingUp, Eye } from "lucide-react";
import AccountForm from "@/components/financial/account-form";
import CreditCardForm from "@/components/financial/credit-card-form";
import { AdvancedFilter, FilterConfig, FilterValues } from "@/components/filters/advanced-filter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getCurrentMonthFilter } from "@/lib/default-filters";
import BankLogo from "@/components/ui/bank-logo";

export default function Accounts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [accountType, setAccountType] = useState<'bank' | 'credit'>('bank');
  const [filters, setFilters] = useState<FilterValues>({
    dateRange: getCurrentMonthFilter()
  });
  const { toast } = useToast();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Conta excluída",
        description: "A conta foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir conta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter configuration
  const filterConfig: FilterConfig = {
    showAmountRange: true,
    showTypes: false,
    showStatus: true,
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setAccountType(account.type === 'credit_card' ? 'credit' : 'bank');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta conta?")) {
      deleteAccountMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingAccount(null);
  };

  const handleNewAccount = (type: 'bank' | 'credit') => {
    setAccountType(type);
    setEditingAccount(null);
    setIsDialogOpen(true);
  };

  // Separate accounts by type
  const allAccounts = (accounts as any[]) || [];
  const bankAccounts = allAccounts.filter((account: any) => account.type !== 'credit_card');
  const creditCards = allAccounts.filter((account: any) => account.type === 'credit_card');

  // Calculate credit card utilization
  const getCreditUtilization = (account: any) => {
    if (!account.creditLimit || account.creditLimit === '0') return 0;
    const used = Math.abs(parseFloat(account.balance || '0'));
    const limit = parseFloat(account.creditLimit);
    return Math.min((used / limit) * 100, 100);
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 30) return 'text-green-600';
    if (utilization <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestão Financeira</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mobile-safe">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold">Gestão Financeira</h1>
          <p className="text-gray-600 text-sm">Gerencie suas contas bancárias e cartões de crédito</p>
        </div>
      </div>

      {/* Filters */}
      <AdvancedFilter
        config={filterConfig}
        filters={filters}
        onFiltersChange={setFilters}
        className="border-b pb-4"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bank Accounts Total */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total em Contas Bancárias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                R$ {bankAccounts.reduce((sum: number, acc: any) => sum + parseFloat(acc.balance || '0'), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{bankAccounts.length} conta(s)</p>
          </CardContent>
        </Card>

        {/* Credit Cards Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cartões de Crédito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">
                R$ {creditCards.reduce((sum: number, acc: any) => sum + parseFloat(acc.creditLimit || '0'), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Limite total ({creditCards.length} cartão/ões)</p>
          </CardContent>
        </Card>

        {/* Credit Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Utilização de Crédito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">
                {creditCards.length > 0 ? Math.round(creditCards.reduce((sum: number, acc: any) => sum + getCreditUtilization(acc), 0) / creditCards.length) : 0}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Utilização média</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Bank Accounts and Credit Cards */}
      <Tabs defaultValue="bank" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Contas Bancárias ({bankAccounts.length})
          </TabsTrigger>
          <TabsTrigger value="credit" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Cartões de Crédito ({creditCards.length})
          </TabsTrigger>
        </TabsList>

        {/* Bank Accounts Tab */}
        <TabsContent value="bank" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Contas Bancárias</h2>
            <Button onClick={() => handleNewAccount('bank')}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
          </div>

          {bankAccounts.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma conta bancária cadastrada
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Adicione suas contas correntes, poupanças e contas de investimento.
                  </p>
                  <Button onClick={() => handleNewAccount('bank')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar primeira conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankAccounts.map((account: any) => (
                <Card key={account.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                          <BankLogo domain={account.domain} name={account.name} size={24} />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BankLogo domain={account.domain} name={account.name} size={20} />
                            {account.name}
                          </CardTitle>
                          <p className="text-sm text-gray-500 capitalize">
                            {account.type === 'checking' ? 'Conta Corrente' : 
                             account.type === 'savings' ? 'Poupança' : 
                             account.type === 'investment' ? 'Investimento' : account.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(account.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Saldo atual</span>
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          R$ {parseFloat(account.balance || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Última atualização</span>
                        <span>{new Date(account.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Credit Cards Tab */}
        <TabsContent value="credit" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Cartões de Crédito</h2>
            <Button onClick={() => handleNewAccount('credit')}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cartão
            </Button>
          </div>

          {creditCards.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum cartão de crédito cadastrado
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Adicione seus cartões de crédito para melhor controle de gastos.
                  </p>
                  <Button onClick={() => handleNewAccount('credit')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar primeiro cartão
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {creditCards.map((card: any) => {
                const utilization = getCreditUtilization(card);
                const utilized = Math.abs(parseFloat(card.balance || '0'));
                const limit = parseFloat(card.creditLimit || '0');
                const available = Math.max(limit - utilized, 0);
                
                return (
                  <Card key={card.id} className="hover:shadow-lg transition-all duration-200 overflow-hidden">
                    {/* Credit Card Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <BankLogo domain={card.domain} name={card.name} size={20} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <BankLogo domain={card.domain} name={card.name} size={16} />
                              {card.name}
                            </h3>
                            <p className="text-purple-100 text-sm">Cartão de Crédito</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handleEdit(card)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => handleDelete(card.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm opacity-90">Limite disponível</span>
                          <Badge variant={card.isActive ? "secondary" : "outline"} className="bg-white/20 text-white border-white/30">
                            {card.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold">
                          R$ {available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* Credit Card Body */}
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Utilization */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Utilização do limite</span>
                            <span className={`text-sm font-semibold ${getUtilizationColor(utilization)}`}>
                              {utilization.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={utilization} className="h-2" />
                          <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                            <span>R$ {utilized.toLocaleString('pt-BR')}</span>
                            <span>R$ {limit.toLocaleString('pt-BR')}</span>
                          </div>
                        </div>

                        {/* Utilization Alert */}
                        {utilization > 70 && (
                          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-800">
                              Alto uso do limite. Considere fazer um pagamento.
                            </span>
                          </div>
                        )}

                        {/* Card Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 block">Fechamento</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="font-medium">Dia {card.closingDay || 'N/A'}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 block">Vencimento</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="font-medium">Dia {card.dueDay || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            Faturas
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Análise
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Account Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccount 
                ? `Editar ${accountType === 'credit' ? 'Cartão' : 'Conta'}` 
                : `Novo ${accountType === 'credit' ? 'Cartão' : 'Conta'}`
              }
            </DialogTitle>
            <DialogDescription>
              {editingAccount 
                ? `Atualize as informações do seu ${accountType === 'credit' ? 'cartão de crédito' : 'conta bancária'}.`
                : `Adicione ${accountType === 'credit' ? 'um novo cartão de crédito' : 'uma nova conta bancária'} ao seu portfólio financeiro.`
              }
            </DialogDescription>
          </DialogHeader>
          {accountType === 'credit' ? (
            <CreditCardForm
              creditCard={editingAccount}
              onSuccess={handleDialogClose}
            />
          ) : (
            <AccountForm
              account={editingAccount}
              onSuccess={handleDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
