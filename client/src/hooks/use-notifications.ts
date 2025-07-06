import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'budget' | 'account' | 'transaction' | 'investment' | 'goal' | 'system';
  actionUrl?: string;
  metadata?: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('dismissed-notifications');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [lastBackupReminder, setLastBackupReminder] = useState<Date>(() => {
    const stored = localStorage.getItem('last-backup-reminder');
    return stored ? new Date(stored) : new Date(0);
  });

  const queryClient = useQueryClient();

  // Fetch notification states from database
  const { data: notificationStates } = useQuery({ 
    queryKey: ["/api/notification-states"] 
  });

  // Create mutations for notification actions
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notification-states/${encodeURIComponent(notificationId)}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-states"] });
    },
  });

  const markAsDismissedMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notification-states/${encodeURIComponent(notificationId)}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Failed to dismiss notification');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-states"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notification-states/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-states"] });
    },
  });

  // Fetch all relevant data for generating notifications
  const { data: accounts } = useQuery({ queryKey: ["/api/accounts"] });
  const { data: transactions } = useQuery({ queryKey: ["/api/transactions"] });
  const { data: budgets } = useQuery({ queryKey: ["/api/budgets"] });
  const { data: goals } = useQuery({ queryKey: ["/api/financial-goals"] });
  const { data: investments } = useQuery({ queryKey: ["/api/investments"] });

  // Generate intelligent notifications based on user data
  const generatedNotifications = useMemo(() => {
    const alerts: Notification[] = [];
    const now = new Date();

    // Budget Alerts
    if (budgets && transactions && Array.isArray(budgets) && Array.isArray(transactions)) {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      budgets.forEach((budget: any) => {
        const monthTransactions = transactions.filter((t: any) => {
          const tDate = new Date(t.date);
          return (
            t.categoryId === budget.categoryId &&
            t.type === 'expense' &&
            tDate.getMonth() === currentMonth &&
            tDate.getFullYear() === currentYear
          );
        });

        const spent = monthTransactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
        const budgetAmount = parseFloat(budget.amount);
        const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

        if (percentage >= 100) {
          alerts.push({
            id: `budget-exceeded-${budget.id}`,
            type: 'error',
            title: 'Orçamento Excedido',
            message: `O orçamento "${budget.name}" foi excedido em ${((spent - budgetAmount) / budgetAmount * 100).toFixed(1)}%`,
            timestamp: new Date(now.getTime() - Math.random() * 86400000), // Random within last day
            isRead: false,
            priority: 'high',
            category: 'budget',
            actionUrl: '/budgets',
            metadata: { budgetId: budget.id, overspent: spent - budgetAmount }
          });
        } else if (percentage >= 80) {
          alerts.push({
            id: `budget-warning-${budget.id}`,
            type: 'warning',
            title: 'Orçamento Próximo do Limite',
            message: `O orçamento "${budget.name}" atingiu ${percentage.toFixed(1)}% do limite`,
            timestamp: new Date(now.getTime() - Math.random() * 43200000), // Random within last 12 hours
            isRead: false,
            priority: 'medium',
            category: 'budget',
            actionUrl: '/budgets',
            metadata: { budgetId: budget.id, percentage }
          });
        }
      });
    }

    // Credit Card Alerts
    if (accounts && Array.isArray(accounts)) {
      accounts.filter((acc: any) => acc.type === 'credit_card').forEach((card: any) => {
        const utilizationPercentage = card.creditLimit > 0 ? (Math.abs(card.balance) / card.creditLimit) * 100 : 0;
        
        if (utilizationPercentage >= 90) {
          alerts.push({
            id: `credit-limit-${card.id}`,
            type: 'error',
            title: 'Limite de Cartão Crítico',
            message: `O cartão ${card.name} está com ${utilizationPercentage.toFixed(1)}% do limite utilizado`,
            timestamp: new Date(now.getTime() - Math.random() * 21600000), // Random within last 6 hours
            isRead: false,
            priority: 'high',
            category: 'account',
            actionUrl: '/accounts',
            metadata: { accountId: card.id, utilization: utilizationPercentage }
          });
        } else if (utilizationPercentage >= 70) {
          alerts.push({
            id: `credit-warning-${card.id}`,
            type: 'warning',
            title: 'Limite de Cartão Elevado',
            message: `O cartão ${card.name} está com ${utilizationPercentage.toFixed(1)}% do limite utilizado`,
            timestamp: new Date(now.getTime() - Math.random() * 43200000),
            isRead: false,
            priority: 'medium',
            category: 'account',
            actionUrl: '/accounts',
            metadata: { accountId: card.id, utilization: utilizationPercentage }
          });
        }
      });
    }

    // Unusual Transaction Alerts
    if (transactions && Array.isArray(transactions) && transactions.length > 0) {
      const recentTransactions = transactions
        .filter((t: any) => {
          const tDate = new Date(t.date);
          const daysDiff = (now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7; // Last 7 days
        })
        .sort((a: any, b: any) => parseFloat(b.amount) - parseFloat(a.amount));

      // Large expense alert
      if (recentTransactions.length > 0) {
        const largestExpense = recentTransactions.find((t: any) => t.type === 'expense');
        if (largestExpense && parseFloat(largestExpense.amount) > 1000) {
          alerts.push({
            id: `large-expense-${largestExpense.id}`,
            type: 'info',
            title: 'Transação Grande Detectada',
            message: `Despesa de R$ ${parseFloat(largestExpense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} foi registrada`,
            timestamp: new Date(largestExpense.date),
            isRead: false,
            priority: 'medium',
            category: 'transaction',
            actionUrl: '/transactions',
            metadata: { transactionId: largestExpense.id, amount: largestExpense.amount }
          });
        }
      }
    }

    // Investment Alerts
    if (investments && Array.isArray(investments)) {
      investments.forEach((investment: any) => {
        const currentValue = parseFloat(investment.currentValue || 0);
        const purchaseValue = parseFloat(investment.purchaseValue || 0);
        
        if (purchaseValue > 0) {
          const returnPercentage = ((currentValue - purchaseValue) / purchaseValue) * 100;
          
          if (returnPercentage <= -10) {
            alerts.push({
              id: `investment-loss-${investment.id}`,
              type: 'warning',
              title: 'Investimento em Queda',
              message: `${investment.name} teve queda de ${Math.abs(returnPercentage).toFixed(1)}%`,
              timestamp: new Date(now.getTime() - Math.random() * 86400000),
              isRead: false,
              priority: 'medium',
              category: 'investment',
              actionUrl: '/investments',
              metadata: { investmentId: investment.id, returnPercentage }
            });
          } else if (returnPercentage >= 15) {
            alerts.push({
              id: `investment-gain-${investment.id}`,
              type: 'success',
              title: 'Investimento em Alta',
              message: `${investment.name} teve ganho de ${returnPercentage.toFixed(1)}%`,
              timestamp: new Date(now.getTime() - Math.random() * 43200000),
              isRead: false,
              priority: 'low',
              category: 'investment',
              actionUrl: '/investments',
              metadata: { investmentId: investment.id, returnPercentage }
            });
          }
        }
      });
    }

    // Goal Progress Alerts
    if (goals && Array.isArray(goals)) {
      goals.forEach((goal: any) => {
        const targetAmount = parseFloat(goal.targetAmount || 0);
        const currentAmount = parseFloat(goal.currentAmount || 0);
        const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

        if (progressPercentage >= 100) {
          alerts.push({
            id: `goal-completed-${goal.id}`,
            type: 'success',
            title: 'Meta Atingida!',
            message: `Parabéns! Você atingiu a meta "${goal.name}"`,
            timestamp: new Date(now.getTime() - Math.random() * 86400000),
            isRead: false,
            priority: 'high',
            category: 'goal',
            actionUrl: '/budgets',
            metadata: { goalId: goal.id, progressPercentage }
          });
        } else if (progressPercentage >= 75) {
          alerts.push({
            id: `goal-progress-${goal.id}`,
            type: 'info',
            title: 'Meta Quase Concluída',
            message: `Você está a ${(100 - progressPercentage).toFixed(1)}% de atingir "${goal.name}"`,
            timestamp: new Date(now.getTime() - Math.random() * 43200000),
            isRead: false,
            priority: 'low',
            category: 'goal',
            actionUrl: '/budgets',
            metadata: { goalId: goal.id, progressPercentage }
          });
        }
      });
    }

    // System Alerts - Only show backup reminder every 7 days
    const daysSinceLastBackup = (now.getTime() - lastBackupReminder.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastBackup >= 7 && !dismissedNotifications.has('system-backup-reminder')) {
      alerts.push({
        id: 'system-backup-reminder',
        type: 'info',
        title: 'Lembrete de Backup',
        message: 'Faça backup regular dos seus dados financeiros para manter suas informações seguras',
        timestamp: new Date(now.getTime() - Math.random() * 43200000), // Random within last 12 hours
        isRead: false,
        priority: 'low',
        category: 'system',
        actionUrl: '/settings',
        metadata: { type: 'recurring', interval: 7 }
      });
    }

    // Sort by priority and timestamp
    return alerts.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [accounts, transactions, budgets, goals, investments]);

  // Merge generated notifications with persistent read states
  const notificationsWithStates = useMemo(() => {
    if (!notificationStates || !Array.isArray(notificationStates)) {
      return generatedNotifications;
    }

    // Create a map of notification states by ID
    const statesMap = notificationStates.reduce((acc: any, state: any) => {
      acc[state.notificationId] = state;
      return acc;
    }, {});

    // Apply persistent states to generated notifications
    return generatedNotifications.map(notification => {
      const state = statesMap[notification.id];
      if (state) {
        return {
          ...notification,
          isRead: state.isRead
        };
      }
      return notification;
    }).filter(notification => {
      // Filter out dismissed notifications
      const state = statesMap[notification.id];
      return !state?.isDismissed;
    });
  }, [generatedNotifications, notificationStates]);

  // Update notifications when data changes
  useEffect(() => {
    setNotifications(notificationsWithStates);
  }, [notificationsWithStates]);

  const markAsRead = async (id: string) => {
    // Optimistically update local state
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    
    // Persist to database
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch (error) {
      // Revert optimistic update on error
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: false }
            : notification
        )
      );
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    // Optimistically update local state
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    
    // Persist to database
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      // Revert optimistic update on error
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: false }))
      );
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: false }
          : notification
      )
    );
  };

  const deleteNotification = async (id: string) => {
    // Optimistically remove from local state
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
    // Persist dismissal to database
    try {
      await markAsDismissedMutation.mutateAsync(id);
      
      // Keep localStorage for backwards compatibility and backup reminder logic
      if (id.startsWith('system-')) {
        const newDismissed = new Set(dismissedNotifications).add(id);
        setDismissedNotifications(newDismissed);
        localStorage.setItem('dismissed-notifications', JSON.stringify(Array.from(newDismissed)));
        
        // For backup reminder, update the last reminder time
        if (id === 'system-backup-reminder') {
          const now = new Date();
          setLastBackupReminder(now);
          localStorage.setItem('last-backup-reminder', now.toISOString());
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setNotifications(prev => [...prev, generatedNotifications.find(n => n.id === id)].filter(Boolean) as Notification[]);
      console.error('Failed to dismiss notification:', error);
    }
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const recentAlerts = notifications.slice(0, 5); // Top 5 most important alerts

  return {
    notifications,
    recentAlerts,
    unreadCount,
    markAsRead,
    markAsUnread,
    deleteNotification,
    markAllAsRead,
    deleteAllNotifications
  };
}