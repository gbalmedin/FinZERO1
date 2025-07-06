import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import AnimatedGoalProgress from '@/components/goals/animated-goal-progress';

const goalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  targetAmount: z.string().min(1, 'Meta é obrigatória'),
  currentAmount: z.string().optional().default('0'),
  deadline: z.string().min(1, 'Prazo é obrigatório'),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

type GoalFormData = z.infer<typeof goalSchema>;

function GoalForm({ goal, onSuccess }: { goal?: any; onSuccess: () => void }) {
  const { toast } = useToast();
  
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name || '',
      description: goal?.description || '',
      targetAmount: goal?.targetAmount?.toString() || '',
      currentAmount: goal?.currentAmount?.toString() || '0',
      deadline: goal?.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      category: goal?.category || '',
      priority: goal?.priority || 'medium',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: GoalFormData) => {
      await apiRequest('POST', '/api/financial-goals', {
        ...data,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: parseFloat(data.currentAmount || '0'),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial-goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: 'Meta criada',
        description: 'A meta foi criada com sucesso.',
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar meta',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: GoalFormData) => {
      await apiRequest('PUT', `/api/financial-goals/${goal.id}`, {
        ...data,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: parseFloat(data.currentAmount || '0'),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial-goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: 'Meta atualizada',
        description: 'A meta foi atualizada com sucesso.',
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar meta',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: GoalFormData) => {
    if (goal) {
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
              <FormLabel>Nome da Meta</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Comprar casa própria" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva sua meta em detalhes..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta</FormLabel>
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
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prazo</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria (Opcional)</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="casa">Casa Própria</SelectItem>
                    <SelectItem value="viagem">Viagem</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                    <SelectItem value="veiculo">Veículo</SelectItem>
                    <SelectItem value="reserva">Reserva de Emergência</SelectItem>
                    <SelectItem value="aposentadoria">Aposentadoria</SelectItem>
                    <SelectItem value="negocio">Negócio Próprio</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {goal ? 'Atualizar Meta' : 'Criar Meta'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Goals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const { toast } = useToast();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['/api/financial-goals'],
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: number; amount: number }) => {
      // Get current goal data first
      const currentGoal = goals?.find((g: any) => g.id === goalId);
      if (!currentGoal) throw new Error('Meta não encontrada');
      
      const newAmount = currentGoal.currentAmount + amount;
      
      await apiRequest('PUT', `/api/financial-goals/${goalId}`, {
        ...currentGoal,
        currentAmount: newAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial-goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: 'Meta atualizada',
        description: 'O progresso da meta foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar meta',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingGoal(null);
  };

  const handleUpdateGoal = (goalId: number, amount: number) => {
    updateGoalMutation.mutate({ goalId, amount });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 mobile-safe">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Metas Financeiras</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mobile-safe">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Metas Financeiras</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Acompanhe suas metas com progresso animado e celebrações
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Nova Meta Financeira'}
              </DialogTitle>
              <DialogDescription>
                {editingGoal ? 'Atualize as informações da sua meta financeira.' : 'Defina uma nova meta financeira com progresso animado e celebrações.'}
              </DialogDescription>
            </DialogHeader>
            <GoalForm
              goal={editingGoal}
              onSuccess={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <AnimatedGoalProgress 
        goals={goals || []}
        onUpdateGoal={handleUpdateGoal}
      />
    </div>
  );
}