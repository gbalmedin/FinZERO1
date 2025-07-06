import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, lazy } from "react";
import { LazyWrapper } from "@/components/ui/lazy-wrapper";
import { PageLoader } from "@/components/ui/page-loader";
import { ConditionalPerformanceDashboard } from "@/components/performance/performance-dashboard";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

// Lazy load page components for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Accounts = lazy(() => import("@/pages/accounts"));
const Transactions = lazy(() => import("@/pages/transactions"));
const Invoices = lazy(() => import("@/pages/invoices"));
const Budgets = lazy(() => import("@/pages/budgets"));
const Categories = lazy(() => import("@/pages/categories"));
const Investments = lazy(() => import("@/pages/investments"));
const Reports = lazy(() => import("@/pages/reports"));
const AiAnalytics = lazy(() => import("@/pages/ai-analytics"));
const Notifications = lazy(() => import("@/pages/alerts"));
const Goals = lazy(() => import("@/pages/goals"));
const Settings = lazy(() => import("@/pages/settings"));
const Profile = lazy(() => import("@/pages/profile"));
const FormDemo = lazy(() => import("@/pages/form-demo"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));

function AuthenticatedApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close sidebar when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        isOpen={isMobile ? isSidebarOpen : true} 
        onClose={closeSidebar} 
      />
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        <Topbar onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 max-w-full">
          <Switch>
            <Route path="/" component={() => <LazyWrapper component={Dashboard} loadingTitle="Carregando Dashboard" loadingSubtitle="Preparando seus dados financeiros" />} />
            <Route path="/accounts" component={() => <LazyWrapper component={Accounts} loadingTitle="Carregando Contas" loadingSubtitle="Buscando suas contas bancárias" />} />
            <Route path="/transactions" component={() => <LazyWrapper component={Transactions} loadingTitle="Carregando Transações" loadingSubtitle="Organizando seu histórico financeiro" />} />
            <Route path="/invoices" component={() => <LazyWrapper component={Invoices} loadingTitle="Carregando Faturas" loadingSubtitle="Preparando suas faturas de cartão" />} />
            <Route path="/budgets" component={() => <LazyWrapper component={Budgets} loadingTitle="Carregando Orçamentos" loadingSubtitle="Analisando seus orçamentos" />} />
            <Route path="/categories" component={() => <LazyWrapper component={Categories} loadingTitle="Carregando Categorias" loadingSubtitle="Organizando suas categorias" />} />
            <Route path="/investments" component={() => <LazyWrapper component={Investments} loadingTitle="Carregando Investimentos" loadingSubtitle="Consultando sua carteira de investimentos" />} />
            <Route path="/reports" component={() => <LazyWrapper component={Reports} loadingTitle="Carregando Relatórios" loadingSubtitle="Gerando relatórios financeiros" />} />
            <Route path="/ai-analytics" component={() => <LazyWrapper component={AiAnalytics} loadingTitle="Carregando Analytics IA" loadingSubtitle="Processando análises inteligentes" />} />
            <Route path="/goals" component={() => <LazyWrapper component={Goals} loadingTitle="Carregando Metas" loadingSubtitle="Verificando o progresso das suas metas" />} />
            <Route path="/alerts" component={() => <LazyWrapper component={Notifications} loadingTitle="Carregando Notificações" loadingSubtitle="Buscando suas notificações" />} />
            <Route path="/settings" component={() => <LazyWrapper component={Settings} loadingTitle="Carregando Configurações" loadingSubtitle="Preparando suas configurações" />} />
            <Route path="/profile" component={() => <LazyWrapper component={Profile} loadingTitle="Carregando Perfil" loadingSubtitle="Carregando informações do perfil" />} />
            <Route path="/form-demo" component={() => <LazyWrapper component={FormDemo} loadingTitle="Carregando Demonstração" loadingSubtitle="Preparando demonstração de formulários" />} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <ConditionalPerformanceDashboard />
    </div>
  );
}

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Login} />
      ) : user && !user.onboardingCompleted ? (
        <Route path="/" component={() => <LazyWrapper component={OnboardingPage} loadingTitle="Carregando Onboarding" loadingSubtitle="Preparando configuração inicial" />} />
      ) : (
        <Route component={AuthenticatedApp} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
