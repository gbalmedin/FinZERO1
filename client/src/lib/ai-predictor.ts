export interface PredictionData {
  type: 'expense_forecast' | 'anomaly_detection' | 'budget_alert' | 'investment_suggestion';
  categoryId?: number;
  confidence: number;
  description: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
  estimatedImpact?: number;
}

export interface ExpenseForecast {
  category: string;
  currentMonth: number;
  predictedNextMonth: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface AnomalyDetection {
  transactionId: number;
  amount: number;
  category: string;
  date: string;
  anomalyScore: number;
  reason: string;
}

export interface BudgetAlert {
  categoryId: number;
  categoryName: string;
  budgetAmount: number;
  currentSpending: number;
  percentageUsed: number;
  daysUntilMonthEnd: number;
  predictedOverage: number;
}

export interface InvestmentSuggestion {
  type: 'emergency_fund' | 'diversification' | 'rebalancing' | 'new_opportunity';
  description: string;
  recommendedAmount: number;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// Simple ML-like prediction functions using historical data patterns
export class FinancialPredictor {
  
  static predictExpenses(transactions: any[], categories: any[]): ExpenseForecast[] {
    const monthlyExpenses = this.getMonthlyExpensesByCategory(transactions);
    const forecasts: ExpenseForecast[] = [];
    
    categories.filter(cat => cat.type === 'expense').forEach(category => {
      const categoryExpenses = monthlyExpenses[category.id] || [];
      
      if (categoryExpenses.length >= 2) {
        const currentMonth = categoryExpenses[categoryExpenses.length - 1] || 0;
        const previousMonth = categoryExpenses[categoryExpenses.length - 2] || 0;
        
        // Simple linear trend prediction
        const trend = currentMonth > previousMonth ? 'increasing' : 
                     currentMonth < previousMonth ? 'decreasing' : 'stable';
        
        const changeRate = previousMonth > 0 ? (currentMonth - previousMonth) / previousMonth : 0;
        const predictedNextMonth = currentMonth * (1 + changeRate);
        
        // Confidence based on historical consistency
        const consistency = this.calculateConsistency(categoryExpenses);
        
        forecasts.push({
          category: category.name,
          currentMonth,
          predictedNextMonth: Math.max(0, predictedNextMonth),
          confidence: consistency,
          trend
        });
      }
    });
    
    return forecasts;
  }
  
  static detectAnomalies(transactions: any[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Group by category to establish baselines
    const categoryGroups = this.groupTransactionsByCategory(expenseTransactions);
    
    Object.entries(categoryGroups).forEach(([categoryId, categoryTransactions]: [string, any[]]) => {
      const amounts = categoryTransactions.map(t => parseFloat(t.amount));
      const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
      const stdDev = Math.sqrt(amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length);
      
      // Detect outliers (values more than 2 standard deviations from mean)
      categoryTransactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        const zScore = Math.abs((amount - mean) / stdDev);
        
        if (zScore > 2 && amount > mean * 1.5) {
          anomalies.push({
            transactionId: transaction.id,
            amount,
            category: transaction.category?.name || 'Unknown',
            date: transaction.date,
            anomalyScore: zScore,
            reason: `Valor ${(zScore * 50).toFixed(0)}% acima da média para esta categoria`
          });
        }
      });
    });
    
    return anomalies.slice(0, 10); // Return top 10 anomalies
  }
  
  static generateBudgetAlerts(budgets: any[], transactions: any[]): BudgetAlert[] {
    const alerts: BudgetAlert[] = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    budgets.forEach(budget => {
      const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear &&
               t.categoryId === budget.categoryId &&
               t.type === 'expense';
      });
      
      const currentSpending = monthlyTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const budgetAmount = parseFloat(budget.amount);
      const percentageUsed = (currentSpending / budgetAmount) * 100;
      
      const now = new Date();
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
      const daysUntilMonthEnd = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Predict monthly overage based on current spending rate
      const daysInMonth = endOfMonth.getDate();
      const daysPassed = now.getDate();
      const dailySpendingRate = currentSpending / daysPassed;
      const predictedMonthlySpending = dailySpendingRate * daysInMonth;
      const predictedOverage = Math.max(0, predictedMonthlySpending - budgetAmount);
      
      if (percentageUsed > 80 || predictedOverage > 0) {
        alerts.push({
          categoryId: budget.categoryId,
          categoryName: budget.name,
          budgetAmount,
          currentSpending,
          percentageUsed,
          daysUntilMonthEnd,
          predictedOverage
        });
      }
    });
    
    return alerts.sort((a, b) => b.percentageUsed - a.percentageUsed);
  }
  
  static generateInvestmentSuggestions(accounts: any[], transactions: any[], investments: any[]): InvestmentSuggestion[] {
    const suggestions: InvestmentSuggestion[] = [];
    
    // Calculate total liquid assets
    const liquidAssets = accounts
      .filter(acc => acc.type !== 'credit_card')
      .reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    
    // Calculate monthly income
    const monthlyIncome = this.calculateMonthlyIncome(transactions);
    const emergencyFundTarget = monthlyIncome * 6;
    const totalInvestments = investments.reduce((sum, inv) => sum + parseFloat(inv.currentAmount || inv.initialAmount), 0);
    
    // Emergency fund suggestion
    if (liquidAssets < emergencyFundTarget) {
      suggestions.push({
        type: 'emergency_fund',
        description: 'Reserva de emergência insuficiente',
        recommendedAmount: emergencyFundTarget - liquidAssets,
        expectedReturn: 0.1, // 10% Selic rate
        riskLevel: 'low'
      });
    }
    
    // Investment diversification
    if (totalInvestments > 0 && investments.length < 3) {
      suggestions.push({
        type: 'diversification',
        description: 'Diversificar portfólio de investimentos',
        recommendedAmount: totalInvestments * 0.2,
        expectedReturn: 0.12,
        riskLevel: 'medium'
      });
    }
    
    // Surplus investment opportunity
    const monthlySurplus = this.calculateMonthlySurplus(transactions);
    if (monthlySurplus > monthlyIncome * 0.1) {
      suggestions.push({
        type: 'new_opportunity',
        description: 'Aplicar excedente mensal',
        recommendedAmount: monthlySurplus,
        expectedReturn: 0.15,
        riskLevel: 'medium'
      });
    }
    
    return suggestions;
  }
  
  private static getMonthlyExpensesByCategory(transactions: any[]): Record<number, number[]> {
    const monthlyData: Record<number, Record<string, number>> = {};
    
    transactions.filter(t => t.type === 'expense').forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyData[transaction.categoryId]) {
        monthlyData[transaction.categoryId] = {};
      }
      
      if (!monthlyData[transaction.categoryId][monthKey]) {
        monthlyData[transaction.categoryId][monthKey] = 0;
      }
      
      monthlyData[transaction.categoryId][monthKey] += parseFloat(transaction.amount);
    });
    
    // Convert to array format
    const result: Record<number, number[]> = {};
    Object.entries(monthlyData).forEach(([categoryId, months]) => {
      result[parseInt(categoryId)] = Object.values(months);
    });
    
    return result;
  }
  
  private static calculateConsistency(values: number[]): number {
    if (values.length < 2) return 0.5;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const coefficient = Math.sqrt(variance) / mean;
    
    // Convert coefficient of variation to confidence (inverse relationship)
    return Math.max(0.1, 1 - Math.min(coefficient, 1));
  }
  
  private static groupTransactionsByCategory(transactions: any[]): Record<string, any[]> {
    return transactions.reduce((groups, transaction) => {
      const categoryId = transaction.categoryId.toString();
      if (!groups[categoryId]) {
        groups[categoryId] = [];
      }
      groups[categoryId].push(transaction);
      return groups;
    }, {} as Record<string, any[]>);
  }
  
  private static calculateMonthlyIncome(transactions: any[]): number {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const lastThreeMonths = incomeTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return transactionDate > threeMonthsAgo;
    });
    
    const totalIncome = lastThreeMonths.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return totalIncome / 3; // Average monthly income
  }
  
  private static calculateMonthlySurplus(transactions: any[]): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth &&
             transactionDate.getFullYear() === currentYear;
    });
    
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    return income - expenses;
  }
}
