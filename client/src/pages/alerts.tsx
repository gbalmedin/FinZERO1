import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Info, Trash2, Eye, EyeOff, X } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const { 
    notifications, 
    markAsRead, 
    markAsUnread, 
    deleteNotification, 
    markAllAsRead, 
    deleteAllNotifications 
  } = useNotifications();
  
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'budget':
        return 'bg-blue-100 text-blue-800';
      case 'account':
        return 'bg-green-100 text-green-800';
      case 'transaction':
        return 'bg-purple-100 text-purple-800';
      case 'investment':
        return 'bg-indigo-100 text-indigo-800';
      case 'goal':
        return 'bg-pink-100 text-pink-800';
      case 'system':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 mobile-safe">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-600 text-sm">Gerencie todas as suas notificações e alertas</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={notifications.filter(n => !n.isRead).length === 0}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <span className="truncate">Marcar Todas como Lidas</span>
          </Button>
          <Button
            variant="destructive"
            onClick={deleteAllNotifications}
            disabled={notifications.length === 0}
            className="w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            <span className="truncate">Excluir Todas</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Não Lidas ({notifications.filter(n => !n.isRead).length})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              Lidas ({notifications.filter(n => n.isRead).length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Você não possui notificações no momento.'
                  : filter === 'unread'
                  ? 'Todas as notificações foram lidas.'
                  : 'Nenhuma notificação lida encontrada.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id}
              className={cn(
                "transition-all hover:shadow-md cursor-pointer",
                !notification.isRead && "border-blue-200 bg-blue-50/50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getPriorityColor(notification.priority)}>
                          Prioridade {notification.priority === 'high' ? 'Alta' : 
                                   notification.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                        <Badge className={getCategoryColor(notification.category)}>
                          {notification.category === 'budget' ? 'Orçamento' :
                           notification.category === 'account' ? 'Conta' :
                           notification.category === 'transaction' ? 'Transação' :
                           notification.category === 'investment' ? 'Investimento' :
                           notification.category === 'goal' ? 'Meta' : 'Sistema'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {notification.timestamp.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedNotification(notification)}
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getIcon(notification.type)}
                            {notification.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Mensagem</h4>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-1">Tipo</h4>
                              <Badge variant="outline">{notification.type}</Badge>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">Prioridade</h4>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority === 'high' ? 'Alta' : 
                                 notification.priority === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">Categoria</h4>
                              <Badge className={getCategoryColor(notification.category)}>
                                {notification.category === 'budget' ? 'Orçamento' :
                                 notification.category === 'account' ? 'Conta' :
                                 notification.category === 'transaction' ? 'Transação' :
                                 notification.category === 'investment' ? 'Investimento' :
                                 notification.category === 'goal' ? 'Meta' : 'Sistema'}
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">Data</h4>
                              <p className="text-sm text-gray-600">
                                {notification.timestamp.toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>

                          {notification.metadata && (
                            <div>
                              <h4 className="font-semibold mb-2">Detalhes Adicionais</h4>
                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(notification.metadata, null, 2)}
                              </pre>
                            </div>
                          )}

                          <div className="flex justify-between pt-4 border-t">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (notification.isRead) {
                                    markAsUnread(notification.id);
                                  } else {
                                    markAsRead(notification.id);
                                  }
                                }}
                              >
                                {notification.isRead ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    Marcar como Não Lida
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-1" />
                                    Marcar como Lida
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  deleteNotification(notification.id);
                                  setSelectedNotification(null);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (notification.isRead) {
                          markAsUnread(notification.id);
                        } else {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      {notification.isRead ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}