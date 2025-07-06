import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/components/ui/currency-input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { createErrorToast } from "@/lib/toast-utils";
import BankSelector, { BRAZILIAN_BANKS } from "@/components/financial/bank-selector";
import { useState } from "react";

const accountSchema = z.object({
  type: z.string().min(1, "Tipo é obrigatório"),
  balance: z.string().min(1, "Saldo é obrigatório"),
  bankName: z.string().optional(),
  domain: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().default(true),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  account?: any;
  onSuccess: () => void;
}

export default function AccountForm({ account, onSuccess }: AccountFormProps) {
  const { toast } = useToast();
  const [selectedBank, setSelectedBank] = useState(() => {
    if (account?.bankName) {
      return BRAZILIAN_BANKS.find(bank => 
        bank.name.toLowerCase() === account.bankName.toLowerCase() ||
        bank.displayName.toLowerCase() === account.bankName.toLowerCase()
      ) || null;
    }
    return null;
  });

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      type: account?.type || 'checking',
      balance: account?.balance || "",
      bankName: account?.bankName || "",
      domain: account?.domain || "",
      color: account?.color || "",
      isActive: account?.isActive !== undefined ? account.isActive : true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      // Auto-generate name based on bank and type
      let accountName = "";
      if (selectedBank) {
        accountName = `${selectedBank.displayName} - ${data.type === 'checking' ? 'Conta Corrente' : 
                      data.type === 'savings' ? 'Poupança' : 'Cartão de Crédito'}`;
      } else {
        accountName = data.type === 'checking' ? 'Conta Corrente' : 
                     data.type === 'savings' ? 'Poupança' : 'Cartão de Crédito';
      }

      const accountData = {
        ...data,
        name: accountName,
        userId: 1 // This should come from auth context
      };
      
      if (selectedBank) {
        accountData.bankName = selectedBank.name;
        accountData.domain = selectedBank.domain;
        accountData.color = selectedBank.color;
      }

      return await apiRequest("POST", "/api/accounts", accountData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Conta criada",
        description: "A conta foi criada com sucesso.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast(createErrorToast("Erro ao criar conta", error.message));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const numericData = {
        ...data,
        balance: parseFloat(data.balance.replace(/\./g, '').replace(',', '.')),
      };
      return await apiRequest("PATCH", `/api/accounts/${account.id}`, numericData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Conta atualizada",
        description: "A conta foi atualizada com sucesso.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast(createErrorToast("Erro ao atualizar conta", error.message));
    },
  });

  const onSubmit = (data: AccountFormData) => {
    if (account) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Bank Selector - moved to top */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Banco
            </label>
            <BankSelector
              value={selectedBank}
              onChange={(bank) => {
                setSelectedBank(bank);
                if (bank) {
                  form.setValue('bankName', bank.name);
                  form.setValue('domain', bank.domain);
                  form.setValue('color', bank.color);
                }
              }}
              placeholder="Selecione um banco"
            />
          </div>

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo da Conta</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="investment">Conta de Investimento</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />



          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo Inicial</FormLabel>
                <FormControl>
                  <CurrencyInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Conta Ativa</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    A conta aparecerá nas listagens e cálculos
                  </div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Salvando..."
              : account
              ? "Atualizar Conta"
              : "Criar Conta"}
          </Button>
        </form>
      </div>
    </Form>
  );
}