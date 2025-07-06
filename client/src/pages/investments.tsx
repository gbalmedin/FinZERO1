import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, TrendingUp, PieChart } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const investmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  institution: z.string().min(1, "Instituição é obrigatória"),
  initialAmount: z.string().min(1, "Valor inicial é obrigatório"),
  currentAmount: z.string().optional(),
  expectedReturn: z.string().optional(),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  maturityDate: z.string().optional(),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

function InvestmentForm({ investment, onSuccess }: { investment?: any; onSuccess: () => void }) {
  const { toast } = useToast();

  const form = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: investment?.name || "",
      type: investment?.type || "",
      institution: investment?.institution || "",
      initialAmount: investment?.initialAmount || "",
      currentAmount: investment?.currentAmount || "",
      expectedReturn: investment?.expectedReturn || "",
      startDate: investment?.startDate || "",
      maturityDate: investment?.maturityDate || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InvestmentFormData) => {
      const response = await apiRequest("POST", "/api/investments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Investimento criado",
        description: "O investimento foi criado com sucesso.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar investimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InvestmentFormData) => {
      const response = await apiRequest("PUT", `/api/investments/${investment.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Investimento atualizado",
        description: "O investimento foi atualizado com sucesso.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar investimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InvestmentFormData) => {
    if (investment) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Investimento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Tesouro Direto IPCA 2035" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="stocks">Ações</SelectItem>
                  <SelectItem value="bonds">Títulos</SelectItem>
                  <SelectItem value="funds">Fundos</SelectItem>
                  <SelectItem value="crypto">Criptomoedas</SelectItem>
                  <SelectItem value="real_estate">Imóveis</SelectItem>
                  <SelectItem value="fixed_income">Renda Fixa</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="institution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instituição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: XP Investimentos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="initialAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Inicial</FormLabel>
                <FormControl>
                  <CurrencyInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Atual</FormLabel>
                <FormControl>
                  <CurrencyInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expectedReturn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rentabilidade Esperada (% a.a.)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0,00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maturityDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vencimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Salvando..."
            : investment
            ? "Atualizar Investimento"
            : "Criar Investimento"}
        </Button>
      </form>
    </Form>
  );
}

export default function Investments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any>(null);
  const { toast } = useToast();

  const { data: investments, isLoading } = useQuery({
    queryKey: ["/api/investments"],
  });

  const deleteInvestmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/investments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Investimento excluído",
        description: "O investimento foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir investimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este investimento?")) {
      deleteInvestmentMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingInvestment(null);
  };

  const getInvestmentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      stocks: "Ações",
      bonds: "Títulos",
      funds: "Fundos",
      crypto: "Criptomoedas",
      real_estate: "Imóveis",
      fixed_income: "Renda Fixa",
    };
    return types[type] || type;
  };

  const calculateReturn = (initial: string, current: string) => {
    const initialAmount = parseFloat(initial);
    const currentAmount = parseFloat(current || initial);
    const returnPercent = ((currentAmount - initialAmount) / initialAmount) * 100;
    return returnPercent;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Investimentos</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalInvestments = investments?.reduce((sum: number, inv: any) => 
    sum + parseFloat(inv.currentAmount || inv.initialAmount), 0) || 0;

  return (
    <div className="space-y-6 mobile-safe">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Investimentos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Investimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingInvestment ? "Editar Investimento" : "Novo Investimento"}
              </DialogTitle>
            </DialogHeader>
            <InvestmentForm
              investment={editingInvestment}
              onSuccess={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Resumo dos Investimentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Investido</p>
              <p className="text-2xl font-bold">
                R$ {totalInvestments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Número de Investimentos</p>
              <p className="text-2xl font-bold">{investments?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rentabilidade Média</p>
              <p className="text-2xl font-bold text-success">
                {investments?.length > 0 
                  ? (investments.reduce((sum: number, inv: any) => 
                      sum + parseFloat(inv.expectedReturn || "0"), 0) / investments.length).toFixed(1)
                  : "0.0"}% a.a.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!investments || investments.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum investimento cadastrado
              </h3>
              <p className="text-gray-500 mb-4">
                Comece adicionando seus investimentos e acompanhe sua rentabilidade.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.map((investment: any) => {
            const returnPercent = calculateReturn(investment.initialAmount, investment.currentAmount);
            const isPositive = returnPercent >= 0;
            
            return (
              <Card key={investment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{investment.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {getInvestmentTypeLabel(investment.type)}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(investment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(investment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Valor Atual</span>
                      <span className="font-semibold">
                        R$ {parseFloat(investment.currentAmount || investment.initialAmount)
                          .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Valor Inicial</span>
                      <span className="text-sm">
                        R$ {parseFloat(investment.initialAmount)
                          .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rentabilidade</span>
                      <span className={`text-sm font-medium ${
                        isPositive ? 'text-success' : 'text-accent'
                      }`}>
                        {isPositive ? '+' : ''}{returnPercent.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Instituição</span>
                      <span className="text-sm">{investment.institution}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Data de Início</span>
                      <span className="text-sm">
                        {new Date(investment.startDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="pt-2">
                      <Badge variant={investment.isActive ? "default" : "secondary"}>
                        {investment.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
