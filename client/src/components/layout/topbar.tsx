import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Bell, Menu, CheckCircle, AlertTriangle, Info, User, Settings, LogOut, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/use-notifications";
import { Link } from "wouter";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const { recentAlerts, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const currentDate = new Date().toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long' 
  });

  const userInitials = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-600 hidden sm:block">{currentDate}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-sm sm:max-w-md p-0" align="end">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Notificações</h4>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {recentAlerts.length === 0 ? (
                  <div className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentAlerts.slice(0, 10).map((alert) => {
                      const getIcon = () => {
                        switch (alert.type) {
                          case 'error':
                            return <AlertTriangle className="w-4 h-4 text-red-500" />;
                          case 'warning':
                            return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
                          case 'success':
                            return <CheckCircle className="w-4 h-4 text-green-500" />;
                          case 'info':
                          default:
                            return <Info className="w-4 h-4 text-blue-500" />;
                        }
                      };

                      return (
                        <div 
                          key={alert.id}
                          className={`p-3 hover:bg-gray-50 transition-colors group ${
                            !alert.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {getIcon()}
                            <div 
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => {
                                markAsRead(alert.id);
                                if (alert.actionUrl) {
                                  window.location.href = alert.actionUrl;
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm truncate">
                                  {alert.title}
                                </p>
                                {!alert.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {alert.timestamp.toLocaleDateString('pt-BR', { 
                                  day: '2-digit', 
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(alert.id);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {recentAlerts.length > 0 && (
                  <div className="p-3 border-t">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href="/alerts">Ver todas as notificações</Link>
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {!isMobile && <span className="text-sm font-medium text-gray-700">{user?.username || 'Usuário'}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username || 'Usuário'}</p>
                  <p className="text-xs leading-none text-muted-foreground">admin@financiapp.com</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
