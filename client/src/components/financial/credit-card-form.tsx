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

const creditCardFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.literal("credit_card"),
  balance: z.string().min(1, "Saldo atual é obrigatório"),
  creditLimit: z.string().min(1, "Limite do cartão é obrigatório"),
  closingDay: z.string().min(1, "Dia do fechamento é obrigatório"),
  dueDay: z.string().min(1, "Dia do vencimento é obrigatório"),
  isActive: z.boolean().default(true),
});

type CreditCardFormData = z.infer<typeof creditCardFormSchema>;

interface CreditCardFormProps {
  creditCard?: any;
  onSuccess?: () => void;
}

export default function CreditCardForm({ creditCard, onSuccess }: CreditCardFormProps) {
  const { toast } = useToast();

  const form = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardFormSchema),
    defaultValues: {
      name: creditCard?.name || "",
      type: "credit_card",
      balance: creditCard?.balance?.toString() || "0",
      creditLimit: creditCard?.creditLimit?.toString() || "",
      closingDay: creditCard?.closingDay?.toString() || "",
      dueDay: creditCard?.dueDay?.toString() || "",
      isActive: creditCard?.isActive ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreditCardFormData) => {
      const formattedData = {
        ...data,
        balance: String(parseFloat(data.balance.replace(/\./g, '').replace(',', '.'))),
        creditLimit: String(parseFloat(data.creditLimit.replace(/\./g, '').replace(',', '.'))),
        closingDay: parseInt(data.closingDay),
        dueDay: parseInt(data.dueDay),
      };
      return await apiRequest("POST", "/api/accounts", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Cartão de crédito criado",
        description: "O cartão foi criado com sucesso.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast(createErrorToast("Erro ao criar cartão", error.message));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CreditCardFormData) => {
      const formattedData = {
        ...data,
        balance: String(parseFloat(data.balance.replace(/\./g, '').replace(',', '.'))),
        creditLimit: String(parseFloat(data.creditLimit.replace(/\./g, '').replace(',', '.'))),
        closingDay: parseInt(data.closingDay),
        dueDay: parseInt(data.dueDay),
      };
      return await apiRequest("PATCH", `/api/accounts/${creditCard.id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Cartão de crédito atualizado",
        description: "O cartão foi atualizado com sucesso.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast(createErrorToast("Erro ao atualizar cartão", error.message));
    },
  });

  const onSubmit = (data: CreditCardFormData) => {
    if (creditCard) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cartão</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Nubank, Itaú Mastercard" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo Atual da Fatura</FormLabel>
                <FormControl>
                  <CurrencyInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="creditLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite do Cartão</FormLabel>
                <FormControl>
                  <CurrencyInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="closingDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia do Fechamento</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="31" placeholder="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia do Vencimento</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="31" placeholder="15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Cartão Ativo</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    O cartão aparecerá nas listagens e cálculos
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
              : creditCard
              ? "Atualizar Cartão"
              : "Criar Cartão"}
          </Button>
        </form>
      </div>
    </Form>
  );
}