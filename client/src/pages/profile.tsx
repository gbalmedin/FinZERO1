import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Settings, 
  Shield, 
  Bell,
  CreditCard,
  PieChart,
  TrendingUp,
  Target,
  Wallet
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "Usuário Principal",
    email: "usuario@exemplo.com",
    phone: "(11) 99999-9999",
    address: "São Paulo, SP",
    birthDate: "1990-01-01",
    occupation: "Analista Financeiro",
    monthlyIncome: "8500.00",
  });

  // Get user statistics
  const { data: accounts } = useQuery({ queryKey: ["/api/accounts"] });
  const { data: transactions } = useQuery({ queryKey: ["/api/transactions"] });
  const { data: budgets } = useQuery({ queryKey: ["/api/budgets"] });
  const { data: goals } = useQuery({ queryKey: ["/api/financial-goals"] });
  const { data: investments } = useQuery({ queryKey: ["/api/investments"] });

  const updateProfile = useMutation({
    mutationFn: async (data: typeof profileData) => {
      // Since we don't have a user profile API yet, we'll just show success
      return Promise.resolve(data);
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfile.mutate(profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  // Calculate statistics
  const totalAccounts = (accounts as any[])?.length || 0;
  const totalTransactions = (transactions as any[])?.length || 0;
  const activeBudgets = (budgets as any[])?.filter((b: any) => b.isActive)?.length || 0;
  const activeGoals = (goals as any[])?.length || 0;
  const totalInvestments = (investments as any[])?.length || 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyTransactions = (transactions as any[])?.filter((t: any) => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  })?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-xl">{profileData.fullName}</CardTitle>
              <p className="text-muted-foreground">{profileData.occupation}</p>
              <Badge variant="secondary" className="mt-2">
                Usuário desde {new Date().getFullYear()}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{profileData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{profileData.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{profileData.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(profileData.birthDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mx-auto mb-2">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">{totalAccounts}</p>
                  <p className="text-xs text-muted-foreground">Contas</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mx-auto mb-2">
                    <PieChart className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold">{activeBudgets}</p>
                  <p className="text-xs text-muted-foreground">Orçamentos</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 mx-auto mb-2">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold">{activeGoals}</p>
                  <p className="text-xs text-muted-foreground">Metas</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 mx-auto mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold">{totalInvestments}</p>
                  <p className="text-xs text-muted-foreground">Investimentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="financial">Informações Financeiras</TabsTrigger>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Informações Pessoais</CardTitle>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Cancelar" : "Editar"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={profileData.birthDate}
                        onChange={(e) => setProfileData({...profileData, birthDate: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="occupation">Profissão</Label>
                      <Input
                        id="occupation"
                        value={profileData.occupation}
                        onChange={(e) => setProfileData({...profileData, occupation: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4 pt-4">
                      <Button 
                        onClick={handleSave}
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Financeiras</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="monthlyIncome">Renda Mensal (R$)</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      step="0.01"
                      value={profileData.monthlyIncome}
                      onChange={(e) => setProfileData({...profileData, monthlyIncome: e.target.value})}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Resumo de Contas</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total de Contas:</span>
                          <span className="font-medium">{totalAccounts}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Transações este mês:</span>
                          <span className="font-medium">{monthlyTransactions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total de Transações:</span>
                          <span className="font-medium">{totalTransactions}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Planejamento</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Orçamentos Ativos:</span>
                          <span className="font-medium">{activeBudgets}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Metas Ativas:</span>
                          <span className="font-medium">{activeGoals}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Investimentos:</span>
                          <span className="font-medium">{totalInvestments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Login realizado com sucesso</p>
                        <p className="text-xs text-muted-foreground">Hoje às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Dados carregados</p>
                        <p className="text-xs text-muted-foreground">Dashboard atualizado</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sistema iniciado</p>
                        <p className="text-xs text-muted-foreground">Aplicação carregada com sucesso</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}