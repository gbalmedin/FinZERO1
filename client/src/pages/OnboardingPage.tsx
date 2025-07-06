import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Wallet, 
  TrendingUp, 
  Target, 
  PiggyBank, 
  Trophy, 
  Sparkles,
  ChevronRight,
  CheckCircle,
  ArrowLeft,
  SkipForward
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Bem-vindo ao FinanceApp!",
    subtitle: "Configure sua conta em poucos passos",
    icon: Sparkles,
    color: "bg-gradient-to-r from-purple-500 to-pink-500"
  },
  {
    id: 2,
    title: "Adicione suas contas",
    subtitle: "Conecte suas contas bancárias e cartões",
    icon: Wallet,
    color: "bg-gradient-to-r from-blue-500 to-cyan-500"
  },
  {
    id: 3,
    title: "Configure categorias",
    subtitle: "Organize seus gastos por categoria",
    icon: TrendingUp,
    color: "bg-gradient-to-r from-green-500 to-emerald-500"
  },
  {
    id: 4,
    title: "Defina metas financeiras",
    subtitle: "Estabeleça objetivos para seu futuro",
    icon: Target,
    color: "bg-gradient-to-r from-orange-500 to-yellow-500"
  },
  {
    id: 5,
    title: "Parabéns! 🎉",
    subtitle: "Sua conta está configurada",
    icon: Trophy,
    color: "bg-gradient-to-r from-pink-500 to-rose-500"
  }
];

const CATEGORIES_PRESETS = [
  { name: "Alimentação", type: "expense", color: "#ef4444", icon: "Utensils" },
  { name: "Transporte", type: "expense", color: "#3b82f6", icon: "Car" },
  { name: "Moradia", type: "expense", color: "#8b5cf6", icon: "Home" },
  { name: "Saúde", type: "expense", color: "#10b981", icon: "Heart" },
  { name: "Entretenimento", type: "expense", color: "#f59e0b", icon: "Film" },
  { name: "Salário", type: "income", color: "#22c55e", icon: "Briefcase" },
  { name: "Freelance", type: "income", color: "#06b6d4", icon: "Laptop" }
];

const GOALS_PRESETS = [
  { name: "Casa própria", category: "casa própria", targetAmount: 500000, priority: "alta" },
  { name: "Viagem dos sonhos", category: "viagem", targetAmount: 15000, priority: "média" },
  { name: "Reserva de emergência", category: "reserva", targetAmount: 50000, priority: "alta" },
  { name: "Carro novo", category: "veículo", targetAmount: 80000, priority: "baixa" }
];

interface OnboardingData {
  accounts: any[];
  categories: any[];
  goals: any[];
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    accounts: [],
    categories: [],
    goals: []
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const progress = ((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100;

  const completeOnboardingMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/onboarding/complete"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Onboarding concluído!",
        description: "Bem-vindo ao FinanceApp! Agora você pode começar a gerenciar suas finanças."
      });
      setLocation("/");
    }
  });

  const skipOnboarding = () => {
    completeOnboardingMutation.mutate();
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    completeOnboardingMutation.mutate();
  };

  const addAccount = (account: any) => {
    setOnboardingData(prev => ({
      ...prev,
      accounts: [...prev.accounts, account]
    }));
  };

  const addCategory = (category: any) => {
    setOnboardingData(prev => ({
      ...prev,
      categories: [...prev.categories, category]
    }));
  };

  const addGoal = (goal: any) => {
    setOnboardingData(prev => ({
      ...prev,
      goals: [...prev.goals, goal]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={nextStep} onSkip={skipOnboarding} />;
      case 2:
        return <AccountsStep onNext={nextStep} onPrev={prevStep} onSkip={skipOnboarding} onAdd={addAccount} data={onboardingData.accounts} />;
      case 3:
        return <CategoriesStep onNext={nextStep} onPrev={prevStep} onSkip={skipOnboarding} onAdd={addCategory} data={onboardingData.categories} />;
      case 4:
        return <GoalsStep onNext={nextStep} onPrev={prevStep} onSkip={skipOnboarding} onAdd={addGoal} data={onboardingData.goals} />;
      case 5:
        return <CompletionStep onComplete={completeOnboarding} data={onboardingData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            {ONBOARDING_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? step.color + ' text-white shadow-lg scale-110' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                  </div>
                  {index < ONBOARDING_STEPS.length - 1 && (
                    <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          <Progress value={progress} className="w-full max-w-md mx-auto mb-4" />
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {ONBOARDING_STEPS[currentStep - 1].title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {ONBOARDING_STEPS[currentStep - 1].subtitle}
            </p>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <CardTitle className="text-2xl">Seja bem-vindo ao FinanceApp!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center text-gray-600 dark:text-gray-300 space-y-4">
          <p>Vamos configurar sua conta para que você tenha a melhor experiência possível.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <Wallet className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">Contas</h3>
              <p className="text-sm">Adicione suas contas bancárias e cartões</p>
            </div>
            <div className="text-center p-4">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Categorias</h3>
              <p className="text-sm">Organize seus gastos por categoria</p>
            </div>
            <div className="text-center p-4">
              <Target className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <h3 className="font-semibold">Metas</h3>
              <p className="text-sm">Defina objetivos financeiros</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={onSkip}>
            <SkipForward className="w-4 h-4 mr-2" />
            Pular configuração
          </Button>
          <Button onClick={onNext} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            Começar configuração
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountsStep({ onNext, onPrev, onSkip, onAdd, data }: any) {
  const [newAccount, setNewAccount] = useState({ name: "", type: "checking", balance: "" });

  const addAccount = () => {
    if (newAccount.name && newAccount.balance) {
      onAdd({
        ...newAccount,
        balance: parseFloat(newAccount.balance.replace(/[^\d,]/g, '').replace(',', '.'))
      });
      setNewAccount({ name: "", type: "checking", balance: "" });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-blue-500" />
          Adicionar Contas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="account-name">Nome da conta</Label>
            <Input
              id="account-name"
              placeholder="Ex: Conta Corrente Nubank"
              value={newAccount.name}
              onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="account-type">Tipo da conta</Label>
            <Select value={newAccount.type} onValueChange={(value) => setNewAccount(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Poupança</SelectItem>
                <SelectItem value="investment">Investimento</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="account-balance">Saldo atual</Label>
            <Input
              id="account-balance"
              placeholder="R$ 0,00"
              value={newAccount.balance}
              onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
            />
          </div>
          
          <Button onClick={addAccount} className="w-full">
            Adicionar Conta
          </Button>
        </div>

        {data.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Contas adicionadas:</h4>
            {data.map((account: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <span className="font-medium">{account.name}</span>
                  <Badge variant="secondary" className="ml-2">{account.type}</Badge>
                </div>
                <span className="font-semibold text-green-600">R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button variant="outline" onClick={onSkip}>
            Pular
          </Button>
          <Button onClick={onNext}>
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoriesStep({ onNext, onPrev, onSkip, onAdd, data }: any) {
  const addPresetCategories = () => {
    CATEGORIES_PRESETS.forEach(category => {
      onAdd(category);
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-500" />
          Configurar Categorias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            As categorias ajudam a organizar e acompanhar seus gastos.
          </p>
          <Button onClick={addPresetCategories} className="mb-4">
            Adicionar categorias essenciais
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIES_PRESETS.map((category, index) => (
            <div key={index} className="text-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div 
                className="w-8 h-8 rounded-full mx-auto mb-2"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm font-medium">{category.name}</span>
              <Badge variant={category.type === "income" ? "default" : "secondary"} className="block mt-1 text-xs">
                {category.type === "income" ? "Receita" : "Gasto"}
              </Badge>
            </div>
          ))}
        </div>

        {data.length > 0 && (
          <div className="text-center">
            <Badge variant="default">{data.length} categorias adicionadas</Badge>
          </div>
        )}

        <div className="flex gap-4 justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button variant="outline" onClick={onSkip}>
            Pular
          </Button>
          <Button onClick={onNext}>
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GoalsStep({ onNext, onPrev, onSkip, onAdd, data }: any) {
  const [selectedGoals, setSelectedGoals] = useState<number[]>([]);

  const toggleGoal = (index: number) => {
    setSelectedGoals(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const addSelectedGoals = () => {
    selectedGoals.forEach(index => {
      onAdd(GOALS_PRESETS[index]);
    });
    onNext();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-6 h-6 text-orange-500" />
          Definir Metas Financeiras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Selecione as metas que fazem sentido para você:
        </p>

        <div className="space-y-3">
          {GOALS_PRESETS.map((goal, index) => (
            <div 
              key={index}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedGoals.includes(index) 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
              onClick={() => toggleGoal(index)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{goal.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{goal.category}</Badge>
                    <Badge variant={goal.priority === "alta" ? "destructive" : goal.priority === "média" ? "default" : "secondary"}>
                      {goal.priority}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">R$ {goal.targetAmount.toLocaleString('pt-BR')}</span>
                  {selectedGoals.includes(index) && (
                    <CheckCircle className="w-6 h-6 text-orange-500 ml-2 inline" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button variant="outline" onClick={onSkip}>
            Pular
          </Button>
          <Button onClick={addSelectedGoals}>
            Finalizar
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CompletionStep({ onComplete, data }: any) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <CardTitle className="text-2xl">Parabéns! 🎉</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Sua conta está configurada e pronta para uso!
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Wallet className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="font-bold text-xl">{data.accounts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Contas</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="font-bold text-xl">{data.categories.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Categorias</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="font-bold text-xl">{data.goals.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Metas</div>
            </div>
          </div>
        </div>

        <Button onClick={onComplete} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-lg py-6">
          Começar a usar o FinanceApp
          <PiggyBank className="w-6 h-6 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}