import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ModernForm, ModernField, ModernSelect } from "@/components/ui/modern-form";
import { ModernInput } from "@/components/ui/modern-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, User, Tag, CreditCard, FileText, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const transactionSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  amount: z.string().min(1, "Valor é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  accountId: z.string().min(1, "Conta é obrigatória"),
  description: z.string().optional(),
  date: z.string().min(1, "Data é obrigatória"),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  isPaid: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.string().optional(),
  recurrenceInterval: z.string().optional(),
  recurrenceEndDate: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface ModernTransactionFormProps {
  transaction?: any;
  onSuccess: () => void;
}

export default function ModernTransactionForm({ transaction, onSuccess }: ModernTransactionFormProps) {
  const { toast } = useToast();

  const { data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: transaction?.title || "",
      amount: transaction?.amount?.toString() || "",
      type: transaction?.type || "",
      categoryId: transaction?.categoryId?.toString() || "",
      accountId: transaction?.accountId?.toString() || "",
      description: transaction?.description || "",
      date: transaction?.date || new Date().toISOString().split('T')[0],
      dueDate: transaction?.dueDate || "",
      paidDate: transaction?.paidDate || "",
      isPaid: transaction?.isPaid || false,
      isRecurring: transaction?.isRecurring || false,
      recurrenceType: transaction?.recurrenceType || "",
      recurrenceInterval: transaction?.recurrenceInterval || "",
      recurrenceEndDate: transaction?.recurrenceEndDate || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      return await apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Transação criada",
        description: "A transação foi criada com sucesso.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar transação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      return await apiRequest("PUT", `/api/transactions/${transaction.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar transação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    if (transaction) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const selectedType = form.watch("type");
  const isRecurring = form.watch("isRecurring");

  return (
    <ModernForm
      title={transaction ? "Editar Transação" : "Nova Transação"}
      description="Registre uma movimentação financeira em suas contas"
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={isLoading}
      submitText={transaction ? "Atualizar" : "Criar"}
      onCancel={onSuccess}
    >
      {/* Título */}
      <ModernField
        label="Título"
        required
        error={form.formState.errors.title?.message}
      >
        <ModernInput
          icon={<FileText className="w-4 h-4" />}
          placeholder="Ex: Supermercado, Salário, Freelance..."
          error={!!form.formState.errors.title}
          {...form.register("title")}
        />
      </ModernField>

      {/* Tipo e Valor - Grid responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ModernField
          label="Tipo"
          required
          error={form.formState.errors.type?.message}
        >
          <ModernSelect
            value={form.watch("type")}
            onValueChange={(value) => form.setValue("type", value)}
            placeholder="Selecione o tipo"
          >
            <option value="income">💰 Receita</option>
            <option value="expense">💸 Despesa</option>
          </ModernSelect>
        </ModernField>

        <ModernField
          label="Valor"
          required
          error={form.formState.errors.amount?.message}
        >
          <CurrencyInput
            error={!!form.formState.errors.amount}
            value={form.watch("amount")}
            onChange={(value) => form.setValue("amount", value)}
          />
        </ModernField>
      </div>

      {/* Categoria e Conta - Grid responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ModernField
          label="Categoria"
          required
          error={form.formState.errors.categoryId?.message}
        >
          <ModernSelect
            value={form.watch("categoryId")}
            onValueChange={(value) => form.setValue("categoryId", value)}
            placeholder="Escolha uma categoria"
          >
            {(categories as any[])
              ?.filter((cat: any) => cat.type === selectedType)
              .map((category: any) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
          </ModernSelect>
        </ModernField>

        <ModernField
          label="Conta"
          required
          error={form.formState.errors.accountId?.message}
        >
          <ModernSelect
            value={form.watch("accountId")}
            onValueChange={(value) => form.setValue("accountId", value)}
            placeholder="Selecione a conta"
          >
            {(accounts as any[])?.map((account: any) => (
              <option key={account.id} value={account.id.toString()}>
                {account.name}
              </option>
            ))}
          </ModernSelect>
        </ModernField>
      </div>

      {/* Data */}
      <ModernField
        label="Data"
        required
        error={form.formState.errors.date?.message}
      >
        <ModernInput
          type="date"
          icon={<Calendar className="w-4 h-4" />}
          error={!!form.formState.errors.date}
          {...form.register("date")}
        />
      </ModernField>

      {/* Descrição */}
      <ModernField
        label="Descrição"
        description="Informações adicionais sobre a transação"
        error={form.formState.errors.description?.message}
      >
        <div className="relative">
          <textarea
            className={cn(
              "flex min-h-[80px] w-full rounded-xl border bg-white px-3 py-2 text-sm font-medium transition-all duration-200",
              "placeholder:text-gray-400 placeholder:font-normal resize-none",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "hover:border-gray-400 border-gray-300"
            )}
            placeholder="Detalhes da transação..."
            {...form.register("description")}
          autoFocus={false}
          />
        </div>
      </ModernField>

      {/* Opções avançadas */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-sm font-semibold text-gray-900">Opções Avançadas</h4>
        
        {/* Status pago */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-900">Já foi paga</span>
            <p className="text-xs text-gray-500">Marque se a transação já foi processada</p>
          </div>
          <Switch
            checked={form.watch("isPaid")}
            onCheckedChange={(checked) => form.setValue("isPaid", checked)}
          />
        </div>

        {/* Recorrência */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-900">Transação recorrente</span>
            <p className="text-xs text-gray-500">Repetir automaticamente</p>
          </div>
          <Switch
            checked={form.watch("isRecurring")}
            onCheckedChange={(checked) => form.setValue("isRecurring", checked)}
          />
        </div>

        {/* Configurações de recorrência */}
        {isRecurring && (
          <div className="mt-4 space-y-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ModernField
                label="Frequência"
                error={form.formState.errors.recurrenceType?.message}
              >
                <ModernSelect
                  value={form.watch("recurrenceType")}
                  onValueChange={(value) => form.setValue("recurrenceType", value)}
                  placeholder="Frequência"
                >
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </ModernSelect>
              </ModernField>

              <ModernField
                label="Data final"
                description="Quando parar a recorrência"
                error={form.formState.errors.recurrenceEndDate?.message}
              >
                <ModernInput
                  type="date"
                  icon={<Clock className="w-4 h-4" />}
                  error={!!form.formState.errors.recurrenceEndDate}
                  {...form.register("recurrenceEndDate")}
                />
              </ModernField>
            </div>
          </div>
        )}
      </div>
    </ModernForm>
  );
}