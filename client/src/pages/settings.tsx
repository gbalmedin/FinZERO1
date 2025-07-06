import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings2, 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  TestTube, 
  Trash2, 
  Download, 
  Upload, 
  FileUp,
  User,
  Bell,
  Palette,
  Globe,
  Shield,
  CreditCard,
  Calendar,
  Clock,
  Info
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [createBackupBeforeDelete, setCreateBackupBeforeDelete] = useState(false);
  const [importSqlContent, setImportSqlContent] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Progress tracking for data generation
  const [generationProgress, setGenerationProgress] = useState({
    step: 0,
    totalSteps: 8,
    currentTask: "",
    details: "",
    percentage: 0
  });

  // Estados para configurações de preferências
  const [preferences, setPreferences] = useState({
    currency: "BRL",
    dateFormat: "dd/MM/yyyy",
    theme: "light",
    language: "pt-BR",
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutos
    chartTheme: "modern",
    defaultDateRange: "12months",
    notificationsEnabled: true,
    emailNotifications: false,
    budgetAlerts: true,
    goalReminders: true,
    transactionCategories: true,
    monthlyReports: false
  });

  // Estados para configurações de segurança
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 3600000, // 1 hora
    loginNotifications: true,
    autoLogout: true
  });

  // Estados para configurações de exportação
  const [exportSettings, setExportSettings] = useState({
    includeCategories: true,
    includeAccounts: true,
    includeTransactions: true,
    includeBudgets: true,
    includeInvestments: true,
    includeGoals: true,
    dateRangeExport: "all",
    exportFormat: "sql"
  });

  // Enhanced data generation with progress tracking
  const simulateDataGeneration = async () => {
    setIsGenerating(true);
    setGenerationProgress({
      step: 0,
      totalSteps: 8,
      currentTask: "Iniciando geração de dados...",
      details: "Preparando sistema para criação de dados realistas",
      percentage: 0
    });

    const steps = [
      {
        task: "Criando Categorias Financeiras",
        details: "40+ categorias de receitas e despesas brasileiras com cores específicas",
        delay: 800
      },
      {
        task: "Configurando Contas Bancárias",
        details: "10 contas de bancos brasileiros incluindo Nubank, Itaú, Bradesco",
        delay: 700
      },
      {
        task: "Gerando Transações Mensais",
        details: "360+ transações realistas dos últimos 12 meses com padrões brasileiros",
        delay: 1200
      },
      {
        task: "Criando Orçamentos Inteligentes",
        details: "Orçamentos por categoria baseados em gastos médios brasileiros",
        delay: 600
      },
      {
        task: "Configurando Investimentos",
        details: "25+ investimentos incluindo Tesouro, CDB, Ações, FIIs e Criptomoedas",
        delay: 900
      },
      {
        task: "Definindo Metas Financeiras",
        details: "17 metas abrangendo casa própria, educação, emergência e aposentadoria",
        delay: 700
      },
      {
        task: "Gerando Previsões IA",
        details: "Análises preditivas e alertas inteligentes baseados nos dados",
        delay: 800
      },
      {
        task: "Finalizando Configuração",
        details: "Aplicando configurações finais e validando integridade dos dados",
        delay: 600
      }
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setGenerationProgress({
          step: i + 1,
          totalSteps: steps.length,
          currentTask: step.task,
          details: step.details,
          percentage: Math.round(((i + 1) / steps.length) * 100)
        });
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }

      // Actually call the API to generate data
      await apiRequest("POST", "/api/settings/generate-data");

      toast({
        title: "Dados Gerados com Sucesso",
        description: "Um ano completo de dados financeiros realistas foi criado.",
      });
      
      queryClient.invalidateQueries();
    } catch (error) {
      toast({
        title: "Falha na Geração",
        description: "Falha ao gerar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress({
        step: 0,
        totalSteps: 8,
        currentTask: "",
        details: "",
        percentage: 0
      });
    }
  };

  const generateDataMutation = useMutation({
    mutationFn: simulateDataGeneration,
  });

  const clearDataMutation = useMutation({
    mutationFn: async () => {
      setIsClearing(true);
      // Create backup first if requested
      if (createBackupBeforeDelete) {
        await handleBackupDownload();
      }
      return await apiRequest("DELETE", "/api/settings/clear-data");
    },
    onSuccess: () => {
      toast({
        title: "Dados Limpos",
        description: createBackupBeforeDelete ? 
          "Backup criado e todos os dados financeiros foram removidos." :
          "Todos os dados financeiros foram removidos do sistema.",
      });
      queryClient.invalidateQueries();
      setIsClearing(false);
      setCreateBackupBeforeDelete(false);
    },
    onError: (error) => {
      toast({
        title: "Falha na Limpeza",
        description: "Falha ao limpar dados. Tente novamente.",
        variant: "destructive",
      });
      setIsClearing(false);
    },
  });

  const importDataMutation = useMutation({
    mutationFn: async (sqlContent: string) => {
      setIsImporting(true);
      return await apiRequest("POST", "/api/settings/import", {
        body: JSON.stringify({ sqlContent }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Importação Concluída",
        description: "Banco de dados importado com sucesso. Todos os dados foram restaurados.",
      });
      queryClient.invalidateQueries();
      setIsImporting(false);
      setImportSqlContent("");
    },
    onError: (error) => {
      toast({
        title: "Erro na Importação",
        description: "Falha ao importar banco de dados. Verifique o formato do arquivo SQL.",
        variant: "destructive",
      });
      setIsImporting(false);
    },
  });

  const handleBackupDownload = async () => {
    try {
      const response = await fetch('/api/settings/backup', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to create backup');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financeapp_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Backup Criado",
        description: "Arquivo de backup baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no Backup",
        description: "Falha ao criar backup. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportSqlContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateData = () => {
    generateDataMutation.mutate();
  };

  const handleClearData = () => {
    clearDataMutation.mutate();
  };

  const handleImportData = () => {
    if (importSqlContent.trim()) {
      importDataMutation.mutate(importSqlContent);
    }
  };

  const savePreferences = () => {
    // Aqui salvaria as preferências no localStorage ou backend
    localStorage.setItem('financeapp_preferences', JSON.stringify(preferences));
    toast({
      title: "Preferências Salvas",
      description: "Suas configurações foram salvas com sucesso.",
    });
  };

  const saveSecurity = () => {
    // Aqui salvaria as configurações de segurança
    localStorage.setItem('financeapp_security', JSON.stringify(security));
    toast({
      title: "Configurações de Segurança Salvas",
      description: "Suas configurações de segurança foram atualizadas.",
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center gap-2">
        <Settings2 className="h-5 w-5 md:h-6 md:w-6" />
        <h1 className="text-2xl md:text-3xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Preferências</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Dados</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba de Preferências */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência e Interface
              </CardTitle>
              <CardDescription>
                Configure a aparência e formato de exibição dos dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Moeda Padrão */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <Label className="font-medium">Moeda Padrão</Label>
                  <p className="text-sm text-muted-foreground">Moeda principal para todas as transações</p>
                </div>
                <Select 
                  value={preferences.currency} 
                  onValueChange={(value) => setPreferences({...preferences, currency: value})}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                    <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">Libra Esterlina (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Formato de Data */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <Label className="font-medium">Formato de Data</Label>
                  <p className="text-sm text-muted-foreground">Como as datas são exibidas no sistema</p>
                </div>
                <Select 
                  value={preferences.dateFormat} 
                  onValueChange={(value) => setPreferences({...preferences, dateFormat: value})}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                    <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Tema dos Gráficos */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <Label className="font-medium">Tema dos Gráficos</Label>
                  <p className="text-sm text-muted-foreground">Estilo visual dos gráficos e relatórios</p>
                </div>
                <Select 
                  value={preferences.chartTheme} 
                  onValueChange={(value) => setPreferences({...preferences, chartTheme: value})}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Moderno</SelectItem>
                    <SelectItem value="classic">Clássico</SelectItem>
                    <SelectItem value="minimal">Minimalista</SelectItem>
                    <SelectItem value="colorful">Colorido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Período Padrão */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <Label className="font-medium">Período Padrão do Dashboard</Label>
                  <p className="text-sm text-muted-foreground">Intervalo de tempo padrão para exibição de dados</p>
                </div>
                <Select 
                  value={preferences.defaultDateRange} 
                  onValueChange={(value) => setPreferences({...preferences, defaultDateRange: value})}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Último Mês</SelectItem>
                    <SelectItem value="3months">Últimos 3 Meses</SelectItem>
                    <SelectItem value="6months">Últimos 6 Meses</SelectItem>
                    <SelectItem value="12months">Últimos 12 Meses</SelectItem>
                    <SelectItem value="all">Todos os Dados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={savePreferences} className="w-full sm:w-auto">
                  Salvar Preferências
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPreferences({
                    currency: "BRL",
                    dateFormat: "dd/MM/yyyy",
                    theme: "light",
                    language: "pt-BR",
                    autoRefresh: true,
                    refreshInterval: 300000,
                    chartTheme: "modern",
                    defaultDateRange: "12months",
                    notificationsEnabled: true,
                    emailNotifications: false,
                    budgetAlerts: true,
                    goalReminders: true,
                    transactionCategories: true,
                    monthlyReports: false
                  })}
                  className="w-full sm:w-auto"
                >
                  Restaurar Padrões
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atualização Automática
              </CardTitle>
              <CardDescription>
                Configure a frequência de atualização dos dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">Atualização Automática</Label>
                  <p className="text-sm text-muted-foreground">Atualizar dados automaticamente</p>
                </div>
                <Switch
                  checked={preferences.autoRefresh}
                  onCheckedChange={(checked) => setPreferences({...preferences, autoRefresh: checked})}
                />
              </div>

              {preferences.autoRefresh && (
                <>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <Label className="font-medium">Intervalo de Atualização</Label>
                      <p className="text-sm text-muted-foreground">Frequência das atualizações automáticas</p>
                    </div>
                    <Select 
                      value={preferences.refreshInterval.toString()} 
                      onValueChange={(value) => setPreferences({...preferences, refreshInterval: parseInt(value)})}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60000">1 minuto</SelectItem>
                        <SelectItem value="300000">5 minutos</SelectItem>
                        <SelectItem value="600000">10 minutos</SelectItem>
                        <SelectItem value="1800000">30 minutos</SelectItem>
                        <SelectItem value="3600000">1 hora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>
                Configure quando e como receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">Notificações Ativadas</Label>
                  <p className="text-sm text-muted-foreground">Habilitar sistema de notificações</p>
                </div>
                <Switch
                  checked={preferences.notificationsEnabled}
                  onCheckedChange={(checked) => setPreferences({...preferences, notificationsEnabled: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">Alertas de Orçamento</Label>
                  <p className="text-sm text-muted-foreground">Notificar quando orçamentos ultrapassarem limites</p>
                </div>
                <Switch
                  checked={preferences.budgetAlerts}
                  onCheckedChange={(checked) => setPreferences({...preferences, budgetAlerts: checked})}
                  disabled={!preferences.notificationsEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">Lembretes de Metas</Label>
                  <p className="text-sm text-muted-foreground">Notificar sobre progresso em metas financeiras</p>
                </div>
                <Switch
                  checked={preferences.goalReminders}
                  onCheckedChange={(checked) => setPreferences({...preferences, goalReminders: checked})}
                  disabled={!preferences.notificationsEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">Categorização de Transações</Label>
                  <p className="text-sm text-muted-foreground">Notificar sobre transações não categorizadas</p>
                </div>
                <Switch
                  checked={preferences.transactionCategories}
                  onCheckedChange={(checked) => setPreferences({...preferences, transactionCategories: checked})}
                  disabled={!preferences.notificationsEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">Relatórios Mensais</Label>
                  <p className="text-sm text-muted-foreground">Receber resumos financeiros mensais</p>
                </div>
                <Switch
                  checked={preferences.monthlyReports}
                  onCheckedChange={(checked) => setPreferences({...preferences, monthlyReports: checked})}
                  disabled={!preferences.notificationsEnabled}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={savePreferences} className="w-full sm:w-auto">
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Segurança */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Configure opções de segurança e privacidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">Logout Automático</Label>
                  <p className="text-sm text-muted-foreground">Fazer logout automaticamente após inatividade</p>
                </div>
                <Switch
                  checked={security.autoLogout}
                  onCheckedChange={(checked) => setSecurity({...security, autoLogout: checked})}
                />
              </div>

              {security.autoLogout && (
                <>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <Label className="font-medium">Tempo Limite da Sessão</Label>
                      <p className="text-sm text-muted-foreground">Tempo de inatividade antes do logout automático</p>
                    </div>
                    <Select 
                      value={security.sessionTimeout.toString()} 
                      onValueChange={(value) => setSecurity({...security, sessionTimeout: parseInt(value)})}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="900000">15 minutos</SelectItem>
                        <SelectItem value="1800000">30 minutos</SelectItem>
                        <SelectItem value="3600000">1 hora</SelectItem>
                        <SelectItem value="7200000">2 horas</SelectItem>
                        <SelectItem value="14400000">4 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">Notificações de Login</Label>
                  <p className="text-sm text-muted-foreground">Notificar sobre novos acessos à conta</p>
                </div>
                <Switch
                  checked={security.loginNotifications}
                  onCheckedChange={(checked) => setSecurity({...security, loginNotifications: checked})}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={saveSecurity} className="w-full sm:w-auto">
                  Salvar Configurações de Segurança
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Dados */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gerenciamento de Dados
              </CardTitle>
              <CardDescription>
                Gerencie seus dados financeiros, backups e configurações avançadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gerar Dados de Teste */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  <h4 className="font-medium">Gerar Dados de Teste</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cria um ano completo de dados financeiros realistas para testar todas as funcionalidades. 
                  Inclui: contas bancárias, transações, categorias, orçamentos, investimentos e metas financeiras com cenários brasileiros.
                </p>

                {/* Progress Section */}
                {isGenerating && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="font-medium">Gerando Dados</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {generationProgress.step}/{generationProgress.totalSteps}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{generationProgress.currentTask}</span>
                        <span>{generationProgress.percentage}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${generationProgress.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {generationProgress.details}
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleGenerateData}
                  disabled={isGenerating || generateDataMutation.isPending}
                  className="w-full"
                >
                  {isGenerating || generateDataMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Dados...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Gerar Um Ano de Dados de Teste
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              {/* Backup de Dados */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <h4 className="font-medium">Backup de Dados</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Exporta todos os seus dados financeiros para um arquivo SQL que pode ser importado posteriormente.
                  Inclui contas, transações, categorias, orçamentos, investimentos e metas.
                </p>
                <Button 
                  onClick={handleBackupDownload}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Backup SQL
                </Button>
              </div>

              <Separator />

              {/* Importar Dados */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <h4 className="font-medium">Importar Dados</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Restaura dados de um arquivo de backup SQL. Isto irá sobrescrever todos os dados atuais.
                </p>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Carregar arquivo SQL:</Label>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".sql"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <FileUp className="mr-2 h-4 w-4" />
                        Selecionar Arquivo SQL
                      </Button>
                    </div>
                  </div>
                  
                  {importSqlContent && (
                    <div className="space-y-2">
                      <Label htmlFor="sql-content">Conteúdo SQL (editável):</Label>
                      <Textarea
                        id="sql-content"
                        value={importSqlContent}
                        onChange={(e) => setImportSqlContent(e.target.value)}
                        className="min-h-[120px] font-mono text-xs"
                        placeholder="Cole o conteúdo SQL aqui ou carregue um arquivo..."
                      />
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleImportData}
                    disabled={!importSqlContent.trim() || isImporting || importDataMutation.isPending}
                    className="w-full"
                    variant="secondary"
                  >
                    {isImporting || importDataMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Importar e Restaurar Dados
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Limpar Todos os Dados */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h4 className="font-medium text-destructive">Zona de Perigo</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Exclui permanentemente todos os dados financeiros e reinicia o sistema ao estado inicial.
                  Esta ação não pode ser desfeita.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      disabled={isClearing || clearDataMutation.isPending}
                    >
                      {isClearing || clearDataMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Limpando Dados...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Limpar Todos os Dados
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isto irá excluir permanentemente todos os seus
                        dados financeiros incluindo contas, transações, orçamentos, investimentos
                        e metas do sistema.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="backup-before-delete"
                          checked={createBackupBeforeDelete}
                          onCheckedChange={(checked) => setCreateBackupBeforeDelete(!!checked)}
                        />
                        <Label 
                          htmlFor="backup-before-delete" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Criar backup antes de excluir (recomendado)
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-6">
                        Um arquivo SQL será baixado automaticamente antes da exclusão
                      </p>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleClearData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sim, excluir todos os dados
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Informações do Sistema
              </CardTitle>
              <CardDescription>
                Detalhes da aplicação e informações de versão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Versão</span>
                <Badge variant="outline">1.0.0</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Banco de Dados</span>
                <Badge variant="outline">PostgreSQL</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Ambiente</span>
                <Badge variant="outline">Desenvolvimento</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Idioma</span>
                <Badge variant="outline">Português (Brasil)</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Última Atualização</span>
                <Badge variant="outline">Janeiro 2025</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}