import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  User, 
  DollarSign, 
  Target, 
  Shield, 
  Zap,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const configurationSteps = [
  {
    id: 'profile',
    title: 'Perfil Pessoal',
    description: 'Configure suas informações básicas',
    icon: User
  },
  {
    id: 'financial',
    title: 'Configuração Financeira',
    description: 'Defina suas metas e limites',
    icon: DollarSign
  },
  {
    id: 'goals',
    title: 'Objetivos',
    description: 'Estabeleça suas metas financeiras',
    icon: Target
  },
  {
    id: 'security',
    title: 'Segurança',
    description: 'Configure alertas e notificações',
    icon: Shield
  },
  {
    id: 'automation',
    title: 'Automação',
    description: 'Personalize comportamentos automáticos',
    icon: Zap
  }
];

// Configuration schemas for each step
const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  income: z.string().min(1, "Renda mensal é obrigatória"),
  budgetPeriod: z.enum(['monthly', 'weekly', 'biweekly']),
  currency: z.string().default('BRL'),
  timezone: z.string().default('America/Sao_Paulo')
});

const financialSchema = z.object({
  emergencyFundGoal: z.string().min(1, "Meta de reserva de emergência é obrigatória"),
  savingsPercentage: z.number().min(1).max(50),
  maxCreditUtilization: z.number().min(10).max(90),
  budgetAlertThreshold: z.number().min(50).max(100)
});

const goalsSchema = z.object({
  primaryGoal: z.string().min(1, "Objetivo principal é obrigatório"),
  timeframe: z.enum(['short', 'medium', 'long']),
  targetAmount: z.string().min(1, "Valor alvo é obrigatório"),
  priority: z.enum(['low', 'medium', 'high'])
});

const securitySchema = z.object({
  enableNotifications: z.boolean().default(true),
  alertLargeTransactions: z.boolean().default(true),
  largeTransactionThreshold: z.string().min(1, "Limite para alertas é obrigatório"),
  enableBudgetAlerts: z.boolean().default(true),
  enableGoalReminders: z.boolean().default(true)
});

const automationSchema = z.object({
  autoCategorizeBanks: z.boolean().default(true),
  autoCreateBudgets: z.boolean().default(false),
  smartSuggestions: z.boolean().default(true),
  dataRetentionMonths: z.number().min(6).max(60).default(24)
});

interface ConfigurationWizardProps {
  onComplete: (config: any) => void;
  onSkip?: () => void;
}

export default function ConfigurationWizard({ onComplete, onSkip }: ConfigurationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [configuration, setConfiguration] = useState({});
  const { toast } = useToast();

  const currentStepData = configurationSteps[currentStep];
  const progress = ((currentStep + 1) / configurationSteps.length) * 100;

  // Form for current step
  const getFormSchema = () => {
    switch(currentStepData.id) {
      case 'profile': return profileSchema;
      case 'financial': return financialSchema;
      case 'goals': return goalsSchema;
      case 'security': return securitySchema;
      case 'automation': return automationSchema;
      default: return profileSchema;
    }
  };

  const form = useForm({
    resolver: zodResolver(getFormSchema()),
    defaultValues: configuration[currentStepData.id as keyof typeof configuration] || {}
  });

  const nextStep = (data: any) => {
    setConfiguration(prev => ({
      ...prev,
      [currentStepData.id]: data
    }));

    if (currentStep < configurationSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      form.reset({});
    } else {
      // Complete configuration
      const finalConfig = {
        ...configuration,
        [currentStepData.id]: data,
        completedAt: new Date().toISOString()
      };
      onComplete(finalConfig);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    const StepIcon = currentStepData.icon;

    switch(currentStepData.id) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <StepIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Renda Mensal</FormLabel>
                    <FormControl>
                      <CurrencyInput {...field} />
                    </FormControl>
                    <FormDescription>
                      Sua renda líquida mensal (após impostos)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período de Orçamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="biweekly">Quinzenal</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <StepIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="emergencyFundGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta de Reserva de Emergência</FormLabel>
                    <FormControl>
                      <CurrencyInput {...field} />
                    </FormControl>
                    <FormDescription>
                      Recomendamos de 3 a 6 meses de gastos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="savingsPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentual de Poupança ({field.value}%)</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={50}
                        step={1}
                        value={[field.value || 10]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Quanto da sua renda você quer poupar mensalmente
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxCreditUtilization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Utilização do Cartão ({field.value}%)</FormLabel>
                    <FormControl>
                      <Slider
                        min={10}
                        max={90}
                        step={5}
                        value={[field.value || 30]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Máximo recomendado: 30% do limite
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetAlertThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alerta de Orçamento ({field.value}%)</FormLabel>
                    <FormControl>
                      <Slider
                        min={50}
                        max={100}
                        step={5}
                        value={[field.value || 80]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Quando alertar sobre gastos do orçamento
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <StepIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="primaryGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo Principal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha seu objetivo principal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="casa_propria">Casa Própria</SelectItem>
                        <SelectItem value="viagem">Viagem dos Sonhos</SelectItem>
                        <SelectItem value="educacao">Educação/Curso</SelectItem>
                        <SelectItem value="veiculo">Veículo</SelectItem>
                        <SelectItem value="reserva">Reserva de Emergência</SelectItem>
                        <SelectItem value="aposentadoria">Aposentadoria</SelectItem>
                        <SelectItem value="negocio">Próprio Negócio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Alvo</FormLabel>
                    <FormControl>
                      <CurrencyInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o prazo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="short">Curto Prazo (até 1 ano)</SelectItem>
                        <SelectItem value="medium">Médio Prazo (1-5 anos)</SelectItem>
                        <SelectItem value="long">Longo Prazo (5+ anos)</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <StepIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="enableNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Notificações Gerais</FormLabel>
                      <FormDescription>
                        Receber notificações sobre atividades financeiras
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alertLargeTransactions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Alertas de Transações Grandes</FormLabel>
                      <FormDescription>
                        Notificar sobre transações acima de um valor
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="largeTransactionThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite para Alertas de Transações</FormLabel>
                    <FormControl>
                      <CurrencyInput {...field} />
                    </FormControl>
                    <FormDescription>
                      Valores acima deste serão alertados
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableBudgetAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Alertas de Orçamento</FormLabel>
                      <FormDescription>
                        Notificar quando se aproximar do limite do orçamento
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableGoalReminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Lembretes de Metas</FormLabel>
                      <FormDescription>
                        Lembrar sobre progresso das metas financeiras
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 'automation':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <StepIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="autoCategorizeBanks"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-categorização</FormLabel>
                      <FormDescription>
                        Categorizar automaticamente transações baseado em bancos
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoCreateBudgets"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Criação Automática de Orçamentos</FormLabel>
                      <FormDescription>
                        Criar orçamentos baseado no histórico de gastos
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smartSuggestions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Sugestões Inteligentes</FormLabel>
                      <FormDescription>
                        Receber sugestões baseadas em IA sobre seus gastos
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataRetentionMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retenção de Dados ({field.value} meses)</FormLabel>
                    <FormControl>
                      <Slider
                        min={6}
                        max={60}
                        step={6}
                        value={[field.value || 24]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Por quanto tempo manter dados históricos
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      default:
        return <div>Etapa não encontrada</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Configuração Inicial</h1>
              <Badge variant="outline">
                Etapa {currentStep + 1} de {configurationSteps.length}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Progresso da configuração</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
          </CardHeader>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(nextStep)} className="space-y-6">
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={previousStep}
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Anterior
                      </Button>
                    )}
                    
                    {onSkip && currentStep === 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={onSkip}
                      >
                        Pular Configuração
                      </Button>
                    )}
                  </div>

                  <Button type="submit">
                    {currentStep === configurationSteps.length - 1 ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Finalizar
                      </>
                    ) : (
                      <>
                        Próximo
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Steps Indicator */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex justify-between">
              {configurationSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={step.id} className={`flex flex-col items-center text-center ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isActive ? 'border-primary bg-primary/10' : 
                      isCompleted ? 'border-green-600 bg-green-100' : 'border-gray-300'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}