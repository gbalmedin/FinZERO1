import { Link, useLocation } from "wouter";
import { 
  Home, 
  CreditCard, 
  ArrowUpDown, 
  Tag, 
  PieChart, 
  FileText, 
  Brain, 
  Bell,
  ChartLine,
  X,
  Receipt,
  Target,
  Trophy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Contas e Cartões", href: "/accounts", icon: CreditCard },
  { name: "Receitas e Despesas", href: "/transactions", icon: ArrowUpDown },
  { name: "Faturas", href: "/invoices", icon: Receipt },
  { name: "Orçamentos", href: "/budgets", icon: Target },
  { name: "Categorias", href: "/categories", icon: Tag },
  { name: "Metas Financeiras", href: "/goals", icon: Trophy },
  { name: "Investimentos", href: "/investments", icon: PieChart },
  { name: "Relatórios", href: "/reports", icon: FileText },
  { name: "Análises IA", href: "/ai-analytics", icon: Brain },
  { name: "Notificações", href: "/alerts", icon: Bell },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { logout, isLoggingOut } = useAuth();
  const isMobile = useIsMobile();
  const { unreadCount } = useNotifications();

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col",
        isMobile && !isOpen && "-translate-x-full",
        isMobile && isOpen && "translate-x-0"
      )}>
        {/* Logo and Brand - Fixed header */}
        <div className="flex-shrink-0 p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <ChartLine className="text-white text-sm md:text-lg" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">FinanceApp</h1>
                <p className="text-xs md:text-sm text-gray-500 truncate">Gestão Financeira</p>
              </div>
            </div>
            {/* Mobile close button */}
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="lg:hidden flex-shrink-0 ml-2"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      
        {/* Navigation - Scrollable content */}
        <nav className="flex-1 overflow-y-auto mt-4 md:mt-6">
          <div className="px-4 md:px-6 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Menu Principal
            </p>
          </div>
          
          <div className="mt-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 md:px-6 py-3 text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "text-primary bg-blue-50 border-r-2 border-primary"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={isMobile ? onClose : undefined}
                >
                  <Icon className="mr-2 md:mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {item.href === "/alerts" && unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
          

        </nav>
      </div>
    </>
  );
}