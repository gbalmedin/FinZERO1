import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ModernForm, ModernField, IconGrid, ModernSelect } from "@/components/ui/modern-form";
import { ModernInput } from "@/components/ui/modern-input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Home, Car, Coffee, ShoppingBag, Heart, Briefcase,
  Gamepad2, Book, Plane, Gift, Zap, Smartphone,
  DollarSign, CreditCard, PiggyBank, Target, Settings,
  TrendingUp, TrendingDown, Tag, Utensils, Train,
  GraduationCap, Baby, Wrench, Music, Camera
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  color: z.string().min(1, "Cor é obrigatória"),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: any;
  onSuccess: () => void;
}

const colorOptions = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Amarelo" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#059669", label: "Verde Escuro" },
  { value: "#a855f7", label: "Roxo" },
  { value: "#ea580c", label: "Laranja" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#6366f1", label: "Índigo" },
];

const iconOptions = [
  { value: "Home", label: "Casa", component: Home },
  { value: "Car", label: "Carro", component: Car },
  { value: "Coffee", label: "Café", component: Coffee },
  { value: "ShoppingBag", label: "Compras", component: ShoppingBag },
  { value: "Heart", label: "Saúde", component: Heart },
  { value: "Briefcase", label: "Trabalho", component: Briefcase },
  { value: "Gamepad2", label: "Entretenimento", component: Gamepad2 },
  { value: "Book", label: "Educação", component: Book },
  { value: "Plane", label: "Viagem", component: Plane },
  { value: "Gift", label: "Presentes", component: Gift },
  { value: "Zap", label: "Energia", component: Zap },
  { value: "Smartphone", label: "Tecnologia", component: Smartphone },
  { value: "DollarSign", label: "Dinheiro", component: DollarSign },
  { value: "CreditCard", label: "Cartão", component: CreditCard },
  { value: "PiggyBank", label: "Poupança", component: PiggyBank },
  { value: "Target", label: "Meta", component: Target },
  { value: "Utensils", label: "Alimentação", component: Utensils },
  { value: "Train", label: "Transporte", component: Train },
  { value: "GraduationCap", label: "Formação", component: GraduationCap },
  { value: "Baby", label: "Família", component: Baby },
  { value: "Wrench", label: "Ferramentas", component: Wrench },
  { value: "Music", label: "Música", component: Music },
  { value: "Camera", label: "Fotografia", component: Camera },
  { value: "Tag", label: "Geral", component: Tag },
];

export default function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const { toast } = useToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || "",
      color: category?.color || colorOptions[0].value,
      icon: category?.icon || "Tag",
      isActive: category?.isActive !== undefined ? category.isActive : true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await apiRequest("PUT", `/api/categories/${category.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    if (category) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <div className="max-h-[70vh] overflow-y-auto px-1">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Categoria</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Alimentação, Transporte" {...field} />
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
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: option.value }}
                          />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ícone</FormLabel>
                <div className="grid grid-cols-6 gap-3 p-4 border rounded-lg max-h-64 overflow-y-auto">
                  {iconOptions.map((icon) => {
                    const IconComponent = icon.component;
                    const isSelected = field.value === icon.value;
                    return (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() => field.onChange(icon.value)}
                        className={`
                          p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1
                          ${isSelected 
                            ? 'border-primary bg-primary/10 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                        title={icon.label}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-xs text-gray-600 truncate w-full text-center">
                          {icon.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
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
                  <FormLabel className="text-base">Categoria Ativa</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    A categoria aparecerá nas listagens
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
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
              : category
              ? "Atualizar Categoria"
              : "Criar Categoria"}
          </Button>
        </form>
      </div>
    </Form>
  );
}
