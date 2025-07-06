import {
  users,
  accounts,
  categories,
  transactions,
  budgets,
  investments,
  financialGoals,
  aiPredictions,
  userNotificationStates,
  type User,
  type InsertUser,
  type Account,
  type InsertAccount,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type Budget,
  type InsertBudget,
  type Investment,
  type InsertInvestment,
  type FinancialGoal,
  type InsertFinancialGoal,
  type AiPrediction,
  type InsertAiPrediction,
  type UserNotificationState,
  type InsertUserNotificationState,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sum, count, between, gte, lte, lt, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(username: string, password: string): Promise<User | null>;
  validateUserByEmail(email: string, password: string): Promise<User | null>;
  resetPassword(email: string, securityPhrase: string, newPassword: string): Promise<boolean>;
  updateLastLogin(userId: number): Promise<void>;
  markOnboardingCompleted(userId: number): Promise<User>;

  // Account operations
  getAccounts(userId: number): Promise<Account[]>;
  getAccount(id: number, userId: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account>;
  deleteAccount(id: number, userId: number): Promise<void>;

  // Category operations
  getCategories(userId: number): Promise<Category[]>;
  getCategory(id: number, userId: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number, userId: number): Promise<void>;

  // Transaction operations
  getTransactions(userId: number, limit?: number, offset?: number): Promise<Transaction[]>;
  getTransaction(id: number, userId: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: number, userId: number): Promise<void>;
  getTransactionsByDateRange(userId: number, startDate: string, endDate: string): Promise<Transaction[]>;
  getTransactionsByCategory(userId: number, categoryId: number): Promise<Transaction[]>;

  // Budget operations
  getBudgets(userId: number): Promise<Budget[]>;
  getBudget(id: number, userId: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget>;
  deleteBudget(id: number, userId: number): Promise<void>;

  // Investment operations
  getInvestments(userId: number): Promise<Investment[]>;
  getInvestment(id: number, userId: number): Promise<Investment | undefined>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: number, investment: Partial<InsertInvestment>): Promise<Investment>;
  deleteInvestment(id: number, userId: number): Promise<void>;

  // Financial Goal operations
  getFinancialGoals(userId: number): Promise<FinancialGoal[]>;
  getFinancialGoal(id: number, userId: number): Promise<FinancialGoal | undefined>;
  createFinancialGoal(goal: InsertFinancialGoal): Promise<FinancialGoal>;
  updateFinancialGoal(id: number, goal: Partial<InsertFinancialGoal>): Promise<FinancialGoal>;
  deleteFinancialGoal(id: number, userId: number): Promise<void>;

  // AI Prediction operations
  getAiPredictions(userId: number): Promise<AiPrediction[]>;
  createAiPrediction(prediction: InsertAiPrediction): Promise<AiPrediction>;

  // Notification State operations
  getNotificationStates(userId: number): Promise<UserNotificationState[]>;
  updateNotificationState(userId: number, notificationId: string, updates: { isRead?: boolean; isDismissed?: boolean }): Promise<UserNotificationState>;
  markNotificationAsRead(userId: number, notificationId: string): Promise<void>;
  markNotificationAsDismissed(userId: number, notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;

  // Dashboard/Analytics operations
  getDashboardData(userId: number): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    totalInvestments: number;
    upcomingBills: Transaction[];
    expensesByCategory: Array<{ category: string; amount: number; color: string }>;
    balanceHistory: Array<{ month: string; balance: number }>;
  }>;

  getFilteredDashboardData(userId: number, filters: any): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    totalInvestments: number;
    upcomingBills: Transaction[];
    expensesByCategory: Array<{ category: string; amount: number; color: string }>;
    balanceHistory: Array<{ month: string; balance: number }>;
  }>;

  // Data Management operations
  generateTestData(userId: number): Promise<void>;
  clearAllData(userId: number): Promise<void>;
  exportDatabaseBackup(userId: number): Promise<string>;
  importDatabaseBackup(userId: number, sqlContent: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.username, username), eq(users.isActive, true)));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.isActive, true)));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      await this.updateLastLogin(user.id);
    }
    return isValid ? user : null;
  }

  async validateUserByEmail(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      await this.updateLastLogin(user.id);
    }
    return isValid ? user : null;
  }

  async resetPassword(email: string, securityPhrase: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.securityPhrase) return false;
    
    if (user.securityPhrase !== securityPhrase) return false;
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));
    
    return true;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }

  async markOnboardingCompleted(userId: number): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ onboardingCompleted: true })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Account operations
  async getAccounts(userId: number): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))
      .orderBy(asc(accounts.name));
  }

  async getAccount(id: number, userId: number): Promise<Account | undefined> {
    const [account] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
    return account || undefined;
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [newAccount] = await db.insert(accounts).values(account).returning();
    return newAccount;
  }

  async updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account> {
    const [updatedAccount] = await db
      .update(accounts)
      .set(account)
      .where(eq(accounts.id, id))
      .returning();
    return updatedAccount;
  }

  async deleteAccount(id: number, userId: number): Promise<void> {
    await db
      .update(accounts)
      .set({ isActive: false })
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
  }

  // Category operations
  async getCategories(userId: number): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.isActive, true)))
      .orderBy(asc(categories.name));
  }

  async getCategory(id: number, userId: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number, userId: number): Promise<void> {
    await db
      .update(categories)
      .set({ isActive: false })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  }

  // Transaction operations
  async getTransactions(userId: number, limit = 50, offset = 0): Promise<Transaction[]> {
    // Optimized for large datasets with composite index on (userId, date)
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date), desc(transactions.id)) // Secondary sort for consistency
      .limit(Math.min(limit, 100)) // Cap at 100 for performance
      .offset(offset);
  }

  // Optimized cursor-based pagination for large datasets (1000+ transactions)
  async getTransactionsCursor(userId: number, limit = 50, cursor?: { date: string, id: number }): Promise<Transaction[]> {
    if (cursor) {
      return await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            or(
              lt(transactions.date, cursor.date),
              and(eq(transactions.date, cursor.date), lt(transactions.id, cursor.id))
            )
          )
        )
        .orderBy(desc(transactions.date), desc(transactions.id))
        .limit(Math.min(limit, 100));
    }

    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date), desc(transactions.id))
      .limit(Math.min(limit, 100));
  }

  async getTransaction(id: number, userId: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return transaction || undefined;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    
    // Update account balance
    const account = await this.getAccount(transaction.accountId, transaction.userId);
    if (account) {
      const balanceChange = transaction.type === 'income' ? 
        parseFloat(transaction.amount) : 
        -parseFloat(transaction.amount);
      
      await this.updateAccount(transaction.accountId, {
        balance: (parseFloat(account.balance || '0') + balanceChange).toString()
      });
    }
    
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async deleteTransaction(id: number, userId: number): Promise<void> {
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  }

  async getTransactionsByDateRange(userId: number, startDate: string, endDate: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          between(transactions.date, startDate, endDate)
        )
      )
      .orderBy(desc(transactions.date));
  }

  async getTransactionsByCategory(userId: number, categoryId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.categoryId, categoryId)))
      .orderBy(desc(transactions.date));
  }

  // Budget operations
  async getBudgets(userId: number): Promise<Budget[]> {
    return await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.isActive, true)))
      .orderBy(asc(budgets.name));
  }

  async getBudget(id: number, userId: number): Promise<Budget | undefined> {
    const [budget] = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
    return budget || undefined;
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db.insert(budgets).values(budget).returning();
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget> {
    const [updatedBudget] = await db
      .update(budgets)
      .set(budget)
      .where(eq(budgets.id, id))
      .returning();
    return updatedBudget;
  }

  async deleteBudget(id: number, userId: number): Promise<void> {
    await db
      .update(budgets)
      .set({ isActive: false })
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
  }

  // Investment operations
  async getInvestments(userId: number): Promise<Investment[]> {
    return await db
      .select()
      .from(investments)
      .where(and(eq(investments.userId, userId), eq(investments.isActive, true)))
      .orderBy(asc(investments.name));
  }

  async getInvestment(id: number, userId: number): Promise<Investment | undefined> {
    const [investment] = await db
      .select()
      .from(investments)
      .where(and(eq(investments.id, id), eq(investments.userId, userId)));
    return investment || undefined;
  }

  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const [newInvestment] = await db.insert(investments).values(investment).returning();
    return newInvestment;
  }

  async updateInvestment(id: number, investment: Partial<InsertInvestment>): Promise<Investment> {
    const [updatedInvestment] = await db
      .update(investments)
      .set(investment)
      .where(eq(investments.id, id))
      .returning();
    return updatedInvestment;
  }

  async deleteInvestment(id: number, userId: number): Promise<void> {
    await db
      .update(investments)
      .set({ isActive: false })
      .where(and(eq(investments.id, id), eq(investments.userId, userId)));
  }

  // Financial Goal operations
  async getFinancialGoals(userId: number): Promise<FinancialGoal[]> {
    return await db
      .select()
      .from(financialGoals)
      .where(and(eq(financialGoals.userId, userId), eq(financialGoals.isActive, true)))
      .orderBy(asc(financialGoals.targetDate));
  }

  async getFinancialGoal(id: number, userId: number): Promise<FinancialGoal | undefined> {
    const [goal] = await db
      .select()
      .from(financialGoals)
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, userId)));
    return goal || undefined;
  }

  async createFinancialGoal(goal: InsertFinancialGoal): Promise<FinancialGoal> {
    const [newGoal] = await db.insert(financialGoals).values(goal).returning();
    return newGoal;
  }

  async updateFinancialGoal(id: number, goal: Partial<InsertFinancialGoal>): Promise<FinancialGoal> {
    const [updatedGoal] = await db
      .update(financialGoals)
      .set(goal)
      .where(eq(financialGoals.id, id))
      .returning();
    return updatedGoal;
  }

  async deleteFinancialGoal(id: number, userId: number): Promise<void> {
    await db
      .update(financialGoals)
      .set({ isActive: false })
      .where(and(eq(financialGoals.id, id), eq(financialGoals.userId, userId)));
  }

  // AI Prediction operations
  async getAiPredictions(userId: number): Promise<AiPrediction[]> {
    return await db
      .select()
      .from(aiPredictions)
      .where(and(eq(aiPredictions.userId, userId), eq(aiPredictions.isActive, true)))
      .orderBy(desc(aiPredictions.createdAt));
  }

  async createAiPrediction(prediction: InsertAiPrediction): Promise<AiPrediction> {
    const [newPrediction] = await db.insert(aiPredictions).values(prediction).returning();
    return newPrediction;
  }

  // Dashboard/Analytics operations
  async getFilteredDashboardData(userId: number, filters: any): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    totalInvestments: number;
    upcomingBills: Transaction[];
    expensesByCategory: Array<{ category: string; amount: number; color: string }>;
    balanceHistory: Array<{ month: string; balance: number }>;
  }> {
    // Get all data first, then filter client-side for simplicity
    const allTransactions = await db
      .select()
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));

    const allAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
    const allInvestments = await db.select().from(investments).where(eq(investments.userId, userId));

    // Apply filters
    const { 
      dateRange = { startDate: '', endDate: '', period: 'last30days' },
      accounts: accountFilter = [],
      categories: categoryFilter = [],
      transactionTypes = [],
      amountRange = { min: '', max: '' },
      includeInvestments = true
    } = filters;

    // Filter transactions
    let filteredTransactions = allTransactions.filter(t => {
      // Date filter
      if (dateRange.startDate && dateRange.endDate) {
        const transactionDate = new Date(t.transactions.date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        if (transactionDate < startDate || transactionDate > endDate) {
          return false;
        }
      }

      // Account filter
      if (accountFilter.length > 0 && !accountFilter.includes(t.transactions.accountId)) {
        return false;
      }

      // Category filter
      if (categoryFilter.length > 0 && !categoryFilter.includes(t.transactions.categoryId)) {
        return false;
      }

      // Transaction type filter
      if (transactionTypes.length > 0 && !transactionTypes.includes(t.transactions.type)) {
        return false;
      }

      // Amount range filter
      const amount = Math.abs(parseFloat(t.transactions.amount));
      if (amountRange.min && amount < parseFloat(amountRange.min)) {
        return false;
      }
      if (amountRange.max && amount > parseFloat(amountRange.max)) {
        return false;
      }

      return true;
    });

    // Calculate metrics
    const totalIncome = filteredTransactions
      .filter(t => t.transactions.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.transactions.amount), 0);

    const totalExpenses = Math.abs(filteredTransactions
      .filter(t => t.transactions.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.transactions.amount), 0));

    // Filter accounts if specified - exclude credit cards from total balance
    let filteredAccounts = allAccounts.filter(acc => acc.type !== 'credit_card');
    if (accountFilter.length > 0) {
      filteredAccounts = filteredAccounts.filter(acc => accountFilter.includes(acc.id));
    }
    const totalBalance = filteredAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || '0'), 0);

    // Investments
    let totalInvestments = 0;
    if (includeInvestments) {
      totalInvestments = allInvestments.reduce((sum, inv) => sum + parseFloat(inv.initialAmount || '0'), 0);
    }

    // Expenses by category
    const categoryExpenses = new Map();
    filteredTransactions
      .filter(t => t.transactions.type === 'expense')
      .forEach(t => {
        const categoryName = t.categories?.name || 'Outros';
        const categoryColor = t.categories?.color || '#6B7280';
        const amount = Math.abs(parseFloat(t.transactions.amount));
        
        if (categoryExpenses.has(categoryName)) {
          categoryExpenses.set(categoryName, {
            ...categoryExpenses.get(categoryName),
            amount: categoryExpenses.get(categoryName).amount + amount
          });
        } else {
          categoryExpenses.set(categoryName, {
            category: categoryName,
            amount: amount,
            color: categoryColor
          });
        }
      });

    const expensesByCategory = Array.from(categoryExpenses.values())
      .sort((a, b) => b.amount - a.amount);

    // Balance history
    const balanceHistory = [];
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
    const startDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000);
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
      if (monthDate >= startDate) {
        const monthKey = monthDate.toISOString().slice(0, 7);
        const monthTransactions = filteredTransactions.filter(t => 
          t.transactions.date.startsWith(monthKey)
        );
        
        const monthBalance = monthTransactions.reduce((sum, t) => {
          return t.transactions.type === 'income' 
            ? sum + parseFloat(t.transactions.amount)
            : sum - Math.abs(parseFloat(t.transactions.amount));
        }, 0);

        balanceHistory.push({
          month: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          balance: monthBalance
        });
      }
    }

    // Upcoming bills
    const upcomingBills: any[] = filteredTransactions
      .filter(t => {
        if (!t.transactions.dueDate) return false;
        const dueDate = new Date(t.transactions.dueDate);
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate >= today && dueDate <= nextWeek && !t.transactions.isPaid;
      })
      .slice(0, 5)
      .map(t => t.transactions);

    return {
      totalBalance,
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      totalInvestments,
      upcomingBills,
      expensesByCategory,
      balanceHistory
    };
  }

  async getDashboardData(userId: number): Promise<{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    totalInvestments: number;
    upcomingBills: Transaction[];
    expensesByCategory: Array<{ category: string; amount: number; color: string }>;
    balanceHistory: Array<{ month: string; balance: number }>;
    monthlyIncomeGoal?: number;
    monthlyBudgetLimit?: number;
    previousMonthBalance?: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Previous month for comparison
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total balance from bank accounts only (exclude credit cards)
    const accountsData = await this.getAccounts(userId);
    const totalBalance = accountsData
      .filter(account => account.type !== 'credit_card')
      .reduce((sum, account) => sum + parseFloat(account.balance || '0'), 0);

    // Get monthly income and expenses
    const monthlyTransactions = await this.getTransactionsByDateRange(
      userId,
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    );

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Get total investments
    const investmentsData = await this.getInvestments(userId);
    const totalInvestments = investmentsData.reduce((sum, inv) => 
      sum + parseFloat(inv.currentAmount || inv.initialAmount), 0);

    // Get upcoming bills
    const upcomingBills = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.isPaid, false),
          between(transactions.dueDate, now.toISOString().split('T')[0], sevenDaysFromNow.toISOString().split('T')[0])
        )
      )
      .orderBy(asc(transactions.dueDate))
      .limit(5);

    // Get expenses by category
    const categoriesData = await this.getCategories(userId);
    const expensesByCategory = await Promise.all(
      categoriesData
        .filter(cat => cat.type === 'expense')
        .map(async (category) => {
          const categoryTransactions = await this.getTransactionsByCategory(userId, category.id);
          const amount = categoryTransactions
            .filter(t => t.type === 'expense' && t.date >= startOfMonth.toISOString().split('T')[0])
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
          return {
            category: category.name,
            amount,
            color: category.color || '#6B7280'
          };
        })
    );

    // Get balance history (last 6 months)
    const balanceHistory = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfHistoricalMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      // Get transactions up to that month
      const historicalTransactions = await this.getTransactionsByDateRange(
        userId,
        '2020-01-01', // Start from early date
        endOfHistoricalMonth.toISOString().split('T')[0]
      );
      
      const historicalBalance = historicalTransactions.reduce((sum, t) => {
        return t.type === 'income' 
          ? sum + parseFloat(t.amount)
          : sum - Math.abs(parseFloat(t.amount));
      }, 0);
      
      balanceHistory.push({
        month: monthName,
        balance: historicalBalance
      });
    }

    // Get budgets and goals for proper calculations
    const budgets = await this.getBudgets(userId);
    const goals = await this.getFinancialGoals(userId);
    
    // Calculate total monthly budget limit
    const monthlyBudgetLimit = budgets
      .filter(b => b.isActive && b.period === 'monthly')
      .reduce((sum, b) => sum + parseFloat(b.amount), 0);
    
    // Calculate monthly income goal from goals
    const monthlyIncomeGoal = goals
      .filter(g => g.category === 'renda' || g.category === 'salario')
      .reduce((sum, g) => sum + parseFloat(g.targetAmount), 0);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      totalInvestments,
      upcomingBills,
      expensesByCategory: expensesByCategory.filter(e => e.amount > 0),
      balanceHistory,
      monthlyBudgetLimit,
      monthlyIncomeGoal
    };
  }

  async generateTestData(userId: number): Promise<void> {
    // Generate comprehensive realistic financial data for complete system testing
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    try {
      // Create comprehensive categories with realistic Brazilian context
      const categories = [
        // Expense categories with realistic colors
        { name: "Alimentação", type: "expense", color: "#ef4444" },
        { name: "Supermercado", type: "expense", color: "#dc2626" },
        { name: "Restaurantes", type: "expense", color: "#f87171" },
        { name: "Transporte", type: "expense", color: "#f97316" },
        { name: "Combustível", type: "expense", color: "#ea580c" },
        { name: "Uber/Taxi", type: "expense", color: "#fb923c" },
        { name: "Transporte Público", type: "expense", color: "#fdba74" },
        { name: "Moradia", type: "expense", color: "#8b5cf6" },
        { name: "Aluguel", type: "expense", color: "#7c3aed" },
        { name: "Financiamento", type: "expense", color: "#a855f7" },
        { name: "Condomínio", type: "expense", color: "#c084fc" },
        { name: "Utilidades", type: "expense", color: "#06b6d4" },
        { name: "Energia Elétrica", type: "expense", color: "#0891b2" },
        { name: "Água", type: "expense", color: "#0e7490" },
        { name: "Internet", type: "expense", color: "#155e75" },
        { name: "Telefone", type: "expense", color: "#67e8f9" },
        { name: "Saúde", type: "expense", color: "#22c55e" },
        { name: "Plano de Saúde", type: "expense", color: "#16a34a" },
        { name: "Farmácia", type: "expense", color: "#15803d" },
        { name: "Consultas", type: "expense", color: "#4ade80" },
        { name: "Exames", type: "expense", color: "#86efac" },
        { name: "Educação", type: "expense", color: "#3b82f6" },
        { name: "Cursos", type: "expense", color: "#2563eb" },
        { name: "Livros", type: "expense", color: "#1d4ed8" },
        { name: "Lazer", type: "expense", color: "#eab308" },
        { name: "Cinema", type: "expense", color: "#d97706" },
        { name: "Streaming", type: "expense", color: "#f59e0b" },
        { name: "Viagens", type: "expense", color: "#fbbf24" },
        { name: "Academia", type: "expense", color: "#fcd34d" },
        { name: "Vestuário", type: "expense", color: "#ec4899" },
        { name: "Beleza", type: "expense", color: "#db2777" },
        { name: "Pets", type: "expense", color: "#be185d" },
        { name: "Seguros", type: "expense", color: "#9333ea" },
        { name: "Seguro Auto", type: "expense", color: "#7e22ce" },
        { name: "Seguro Vida", type: "expense", color: "#6b21a8" },
        { name: "Impostos", type: "expense", color: "#b91c1c" },
        { name: "IPTU", type: "expense", color: "#991b1b" },
        { name: "IPVA", type: "expense", color: "#7f1d1d" },
        { name: "Parcelamento", type: "expense", color: "#6b7280" },
        { name: "Diversos", type: "expense", color: "#6b7280" },
        
        // Income categories
        { name: "Salário", type: "income", color: "#10b981" },
        { name: "Salário Líquido", type: "income", color: "#059669" },
        { name: "13º Salário", type: "income", color: "#047857" },
        { name: "Férias", type: "income", color: "#065f46" },
        { name: "Freelance", type: "income", color: "#06b6d4" },
        { name: "Consultoria", type: "income", color: "#0891b2" },
        { name: "Vendas", type: "income", color: "#0e7490" },
        { name: "Investimentos", type: "income", color: "#84cc16" },
        { name: "Dividendos", type: "income", color: "#65a30d" },
        { name: "Rendimento CDB", type: "income", color: "#4d7c0f" },
        { name: "Poupança", type: "income", color: "#365314" },
        { name: "Aluguéis", type: "income", color: "#14b8a6" },
        { name: "Outros", type: "income", color: "#0d9488" },
      ];

      const createdCategories: Category[] = [];
      for (const cat of categories) {
        const category = await this.createCategory({ ...cat, userId });
        createdCategories.push(category);
      }

      // Create comprehensive accounts with realistic Brazilian financial institutions and proper credit card data
      const accounts = [
        // Checking Accounts (Conta Corrente) - Always positive balances
        { name: "Nubank Conta", type: "checking", balance: "8542.67", bankName: "Nubank", color: "#8A2BE2", accountNumber: "12345-6", domain: "nubank.com.br" },
        { name: "Conta Corrente BB", type: "checking", balance: "12456.78", bankName: "Banco do Brasil", color: "#FFD400", accountNumber: "34567-8", domain: "bb.com.br" },
        { name: "Conta Salário Itaú", type: "checking", balance: "4567.89", bankName: "Itaú Unibanco", color: "#FF6B00", accountNumber: "78901-2", domain: "itau.com.br" },
        { name: "Conta Bradesco", type: "checking", balance: "6890.45", bankName: "Bradesco", color: "#CC092F", accountNumber: "55443-3", domain: "bradesco.com.br" },
        
        // Savings Accounts (Poupança) - Always positive balances
        { name: "Poupança Bradesco", type: "savings", balance: "34678.90", bankName: "Bradesco", color: "#CC092F", accountNumber: "98765-4", domain: "bradesco.com.br" },
        { name: "Caixa Poupança", type: "savings", balance: "18934.56", bankName: "Caixa Econômica Federal", color: "#0066CC", accountNumber: "11223-3", domain: "caixa.gov.br" },
        { name: "Poupança Santander", type: "savings", balance: "25789.12", bankName: "Santander", color: "#EC0000", accountNumber: "44556-6", domain: "santander.com.br" },
        
        // Investment Accounts (Conta Investimento) - Always positive balances
        { name: "Inter Investimentos", type: "investment", balance: "45789.23", bankName: "Inter", color: "#FF6B35", accountNumber: "77889-9", domain: "bancointer.com.br" },
        { name: "Conta XP", type: "investment", balance: "67890.12", bankName: "XP Investimentos", color: "#FF6B35", accountNumber: "99887-1", domain: "xpi.com.br" },
        { name: "Rico Investimentos", type: "investment", balance: "38567.44", bankName: "Rico", color: "#00A859", accountNumber: "22334-4", domain: "rico.com.vc" },
        
        // Credit Cards with realistic limits, usage, and due dates for invoice generation
        { name: "Cartão Nubank", type: "credit_card", balance: "-2847.35", creditLimit: "12000.00", bankName: "Nubank", color: "#8A2BE2", accountNumber: "**** 5678", dueDay: 15, domain: "nubank.com.br" },
        { name: "Cartão Santander", type: "credit_card", balance: "-892.44", creditLimit: "8000.00", bankName: "Santander", color: "#EC0000", accountNumber: "**** 9012", dueDay: 5, domain: "santander.com.br" },
        { name: "Cartão Itaú", type: "credit_card", balance: "-1234.77", creditLimit: "15000.00", bankName: "Itaú Unibanco", color: "#FF6B00", accountNumber: "**** 1234", dueDay: 10, domain: "itau.com.br" },
        { name: "Cartão Bradesco", type: "credit_card", balance: "-3567.88", creditLimit: "20000.00", bankName: "Bradesco", color: "#CC092F", accountNumber: "**** 3456", dueDay: 20, domain: "bradesco.com.br" },
        { name: "Cartão C6 Bank", type: "credit_card", balance: "-567.23", creditLimit: "6000.00", bankName: "C6 Bank", color: "#000000", accountNumber: "**** 7890", dueDay: 25, domain: "c6bank.com.br" },
      ];

      const createdAccounts: Account[] = [];
      for (const acc of accounts) {
        const account = await this.createAccount({ ...acc, userId });
        createdAccounts.push(account);
      }

      // Generate comprehensive transactions for the past year with realistic patterns
      const expenseCategories = createdCategories.filter(c => c.type === "expense");
      const incomeCategories = createdCategories.filter(c => c.type === "income");

      // Helper function to get category by name
      const getCategoryByName = (name: string) => createdCategories.find(c => c.name === name);
      
      // Helper function to get random account by type preference
      const getAccountByType = (preferredTypes: string[]) => {
        const preferredAccounts = createdAccounts.filter(acc => preferredTypes.includes(acc.type));
        return preferredAccounts.length > 0 ? 
          preferredAccounts[Math.floor(Math.random() * preferredAccounts.length)] :
          createdAccounts[Math.floor(Math.random() * createdAccounts.length)];
      };

      // Generate comprehensive monthly data with realistic Brazilian financial patterns
      for (let month = 0; month < 12; month++) {
        const currentDate = new Date(startDate);
        currentDate.setMonth(currentDate.getMonth() + month);
        const isCurrentMonth = month === 11; // Last month is current month

        // MONTHLY INCOME GENERATION
        const salaryAccount = getAccountByType(['checking']);
        
        // 1. Main salary (always on 5th) - always positive
        const salaryCategory = getCategoryByName("Salário Líquido");
        if (salaryCategory) {
          const salaryAmount = 7500 + Math.random() * 1500; // Positive income
          await this.createTransaction({
            userId,
            accountId: salaryAccount.id,
            categoryId: salaryCategory.id,
            title: "Salário Mensal - Empresa ABC",
            amount: salaryAmount.toFixed(2),
            description: "Salário líquido após descontos",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5).toISOString().split('T')[0],
            type: "income",
            isPaid: true,
            paidDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5).toISOString().split('T')[0]
          });
        }

        // 2. Additional income streams
        if (Math.random() > 0.3) { // 70% chance
          const freelanceCategory = getCategoryByName("Freelance");
          if (freelanceCategory) {
            const freelanceAmount = 1200 + Math.random() * 2800; // Positive income
            await this.createTransaction({
              userId,
              accountId: salaryAccount.id,
              categoryId: freelanceCategory.id,
              title: "Projeto Freelance - Desenvolvimento",
              amount: freelanceAmount.toFixed(2),
              description: "Desenvolvimento de aplicativo mobile",
              date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15 + Math.random() * 10).toISOString().split('T')[0],
              type: "income",
              isPaid: true,
              paidDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15 + Math.random() * 10).toISOString().split('T')[0]
            });
          }
        }

        // 3. Investment returns (quarterly)
        if (month % 3 === 0) {
          const dividendsCategory = getCategoryByName("Dividendos");
          if (dividendsCategory) {
            const dividendAmount = 450 + Math.random() * 550; // Positive income
            await this.createTransaction({
              userId,
              accountId: getAccountByType(['investment']).id,
              categoryId: dividendsCategory.id,
              title: "Dividendos ITUB4",
              amount: dividendAmount.toFixed(2),
              description: "Dividendos Itaú Unibanco",
              date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 28).toISOString().split('T')[0],
              type: "income",
              isPaid: true,
              paidDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 28).toISOString().split('T')[0]
            });
          }
        }

        // 4. Monthly savings interest - always positive
        const savingsCategory = getCategoryByName("Poupança");
        if (savingsCategory) {
          const interestAmount = 35 + Math.random() * 65; // Positive income
          await this.createTransaction({
            userId,
            accountId: getAccountByType(['savings']).id,
            categoryId: savingsCategory.id,
            title: "Rendimento Poupança",
            amount: interestAmount.toFixed(2),
            description: "Rendimento mensal da poupança",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 30).toISOString().split('T')[0],
            type: "income",
            isPaid: true,
            paidDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 30).toISOString().split('T')[0]
          });
        }

        // MONTHLY FIXED EXPENSES - Generate bills and recurring payments
        const expenseData = [
          { categoryName: "Aluguel", amount: 2000, day: 1, account: 'checking' },
          { categoryName: "Condomínio", amount: 450, day: 5, account: 'checking' },
          { categoryName: "Energia Elétrica", amount: 180 + Math.random() * 50, day: 8, account: 'checking' },
          { categoryName: "Água", amount: 80 + Math.random() * 20, day: 10, account: 'checking' },
          { categoryName: "Internet", amount: 120, day: 12, account: 'checking' },
          { categoryName: "Telefone", amount: 100, day: 15, account: 'checking' },
          { categoryName: "Plano de Saúde", amount: 450, day: 3, account: 'checking' },
          { categoryName: "Academia", amount: 150, day: 5, account: 'checking' },
          { categoryName: "Seguro Auto", amount: 200, day: 10, account: 'checking' },
        ];

        for (const expense of expenseData) {
          const category = getCategoryByName(expense.categoryName);
          if (category) {
            const expenseAmount = Math.abs(expense.amount); // Ensure positive for expenses
            await this.createTransaction({
              userId,
              accountId: getAccountByType(['checking']).id,
              categoryId: category.id,
              title: `${expense.categoryName} - ${currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
              amount: expenseAmount.toFixed(2),
              description: `Pagamento mensal de ${expense.categoryName.toLowerCase()}`,
              date: new Date(currentDate.getFullYear(), currentDate.getMonth(), expense.day).toISOString().split('T')[0],
              type: "expense",
              isPaid: Math.random() > 0.1, // 90% paid, 10% pending
              paidDate: Math.random() > 0.1 ? new Date(currentDate.getFullYear(), currentDate.getMonth(), expense.day).toISOString().split('T')[0] : undefined,
              dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), expense.day).toISOString().split('T')[0]
            });
          }
        }

        // CREDIT CARD TRANSACTIONS - Generate realistic shopping patterns
        const creditCards = createdAccounts.filter(acc => acc.type === 'credit_card');
        for (const card of creditCards) {
          // Generate 5-15 credit card transactions per month
          const numTransactions = 5 + Math.floor(Math.random() * 10);
          
          for (let i = 0; i < numTransactions; i++) {
            const randomDay = Math.floor(Math.random() * 28) + 1;
            const transactionDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), randomDay);
            
            const expenseCategory = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
            const amount = -(20 + Math.random() * 300); // Negative expense R$20-320 range
            
            await this.createTransaction({
              userId,
              accountId: card.id,
              categoryId: expenseCategory.id,
              title: `${expenseCategory.name} - Compra`,
              amount: amount.toFixed(2),
              description: `Compra no cartão ${card.name}`,
              date: transactionDate.toISOString().split('T')[0],
              type: "expense",
              isPaid: true,
              paidDate: transactionDate.toISOString().split('T')[0]
            });
          }
        }

        // DAILY VARIABLE EXPENSES - Generate random daily expenses
        for (let day = 1; day <= 28; day++) {
          if (Math.random() > 0.6) { // 40% chance of daily expense
            const transactionDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const expenseCategory = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
            const amount = -(15 + Math.random() * 85); // Negative expense R$15-100 range
            
            await this.createTransaction({
              userId,
              accountId: getAccountByType(['checking', 'credit_card']).id,
              categoryId: expenseCategory.id,
              title: `${expenseCategory.name} - Gasto diário`,
              amount: amount.toFixed(2),
              description: `Gasto do dia ${day}`,
              date: transactionDate.toISOString().split('T')[0],
              type: "expense",
              isPaid: Math.random() > 0.2, // 80% paid
              paidDate: Math.random() > 0.2 ? transactionDate.toISOString().split('T')[0] : undefined
            });
          }
        }

        // 5. 13th salary in December - always positive
        if (currentDate.getMonth() === 11) {
          const thirteenthCategory = getCategoryByName("13º Salário");
          if (thirteenthCategory) {
            const thirteenthAmount = 7500 + Math.random() * 1500; // Positive income
            await this.createTransaction({
              userId,
              accountId: salaryAccount.id,
              categoryId: thirteenthCategory.id,
              title: "13º Salário",
              amount: thirteenthAmount.toFixed(2),
              description: "Décimo terceiro salário",
              date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20).toISOString().split('T')[0],
              type: "income",
              isPaid: true,
              paidDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20).toISOString().split('T')[0]
            });
          }
        }

        // 6. Vacation payment (once per year) - always positive
        if (month === 6) {
          const vacationCategory = getCategoryByName("Férias");
          if (vacationCategory) {
            const vacationAmount = 9000 + Math.random() * 2000; // Positive income
            await this.createTransaction({
              userId,
              accountId: salaryAccount.id,
              categoryId: vacationCategory.id,
              title: "Pagamento de Férias",
              amount: vacationAmount.toFixed(2),
              description: "Férias + 1/3 constitucional",
              date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10).toISOString().split('T')[0],
              type: "income",
              isPaid: true,
              paidDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10).toISOString().split('T')[0]
            });
          }
        }

        // INSTALLMENT PAYMENTS - Generate some installment transactions
        if (Math.random() > 0.7) { // 30% chance per month
          const installmentCategory = getCategoryByName("Parcelamento");
          if (installmentCategory) {
            const installmentAmount = Math.abs(100 + Math.random() * 400);
            await this.createTransaction({
              userId,
              accountId: getAccountByType(['credit_card']).id,
              categoryId: installmentCategory.id,
              title: `Parcelamento 3/12 - Smartphone`,
              amount: installmentAmount.toFixed(2),
              description: "Parcela mensal de compra anterior",
              date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15).toISOString().split('T')[0],
              type: "expense",
              isPaid: true,
              paidDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15).toISOString().split('T')[0]
            });
          }
        }
      }

      // Create comprehensive budgets
      const budgetData = [
        { categoryName: "Alimentação", amount: 1200 },
        { categoryName: "Supermercado", amount: 800 },
        { categoryName: "Restaurantes", amount: 400 },
        { categoryName: "Transporte", amount: 600 },
        { categoryName: "Combustível", amount: 300 },
        { categoryName: "Uber/Taxi", amount: 200 },
        { categoryName: "Moradia", amount: 2500 },
        { categoryName: "Aluguel", amount: 2000 },
        { categoryName: "Utilidades", amount: 500 },
        { categoryName: "Energia Elétrica", amount: 180 },
        { categoryName: "Água", amount: 80 },
        { categoryName: "Internet", amount: 120 },
        { categoryName: "Telefone", amount: 100 },
        { categoryName: "Saúde", amount: 800 },
        { categoryName: "Plano de Saúde", amount: 450 },
        { categoryName: "Farmácia", amount: 200 },
        { categoryName: "Lazer", amount: 600 },
        { categoryName: "Streaming", amount: 80 },
        { categoryName: "Academia", amount: 150 },
        { categoryName: "Vestuário", amount: 300 },
        { categoryName: "Seguros", amount: 400 },
        { categoryName: "Seguro Auto", amount: 200 },
        { categoryName: "Educação", amount: 250 },
      ];

      for (const budget of budgetData) {
        const category = createdCategories.find(c => c.name === budget.categoryName);
        if (category) {
          await this.createBudget({
            userId,
            categoryId: category.id,
            name: `Orçamento ${category.name}`,
            amount: budget.amount.toFixed(2),
            period: "monthly",
            startDate: new Date().toISOString().split('T')[0]
          });
        }
      }

      // Create comprehensive investment portfolio
      const investments = [
        // Bonds and Fixed Income
        { name: "Tesouro SELIC 2027", type: "bonds", institution: "Tesouro Nacional", initialAmount: "15000.00", expectedReturn: "11.75", startDate: "2024-01-15" },
        { name: "Tesouro IPCA+ 2029", type: "bonds", institution: "Tesouro Nacional", initialAmount: "25000.00", expectedReturn: "5.50", startDate: "2024-02-01" },
        { name: "CDB Banco Inter", type: "bonds", institution: "Banco Inter", initialAmount: "20000.00", expectedReturn: "12.80", startDate: "2024-01-05" },
        { name: "LCI Santander", type: "bonds", institution: "Santander", initialAmount: "18000.00", expectedReturn: "10.90", startDate: "2024-02-10" },
        { name: "LCA Bradesco", type: "bonds", institution: "Bradesco", initialAmount: "22000.00", expectedReturn: "11.20", startDate: "2024-03-01" },
        { name: "Debêntures Suzano", type: "bonds", institution: "Suzano", initialAmount: "12000.00", expectedReturn: "13.40", startDate: "2024-01-20" },
        
        // Stocks - Blue Chips
        { name: "Itaú Unibanco (ITUB4)", type: "stocks", institution: "Itaú Unibanco", initialAmount: "8000.00", expectedReturn: "18.50", startDate: "2024-01-08" },
        { name: "Petrobras (PETR4)", type: "stocks", institution: "Petrobras", initialAmount: "12000.00", expectedReturn: "22.30", startDate: "2024-01-12" },
        { name: "Vale (VALE3)", type: "stocks", institution: "Vale", initialAmount: "10000.00", expectedReturn: "16.80", startDate: "2024-02-05" },
        { name: "Magazine Luiza (MGLU3)", type: "stocks", institution: "Magazine Luiza", initialAmount: "5000.00", expectedReturn: "25.70", startDate: "2024-02-15" },
        { name: "Banco do Brasil (BBAS3)", type: "stocks", institution: "Banco do Brasil", initialAmount: "7500.00", expectedReturn: "19.20", startDate: "2024-01-25" },
        { name: "JBS (JBSS3)", type: "stocks", institution: "JBS", initialAmount: "6000.00", expectedReturn: "17.40", startDate: "2024-03-10" },
        
        // Real Estate Investment Trusts (FIIs)
        { name: "HGLG11 - Cshg Logística", type: "real_estate", institution: "XP Investimentos", initialAmount: "15000.00", expectedReturn: "9.80", startDate: "2024-01-18" },
        { name: "XPML11 - XP Malls", type: "real_estate", institution: "XP Investimentos", initialAmount: "12000.00", expectedReturn: "8.90", startDate: "2024-02-08" },
        { name: "BCFF11 - BC Fundos", type: "real_estate", institution: "BTG Pactual", initialAmount: "18000.00", expectedReturn: "10.20", startDate: "2024-01-30" },
        { name: "KNRI11 - Kinea Renda", type: "real_estate", institution: "Itaú", initialAmount: "20000.00", expectedReturn: "9.60", startDate: "2024-02-20" },
        
        // Investment Funds
        { name: "Fundo Multimercado XP", type: "funds", institution: "XP Investimentos", initialAmount: "25000.00", expectedReturn: "14.50", startDate: "2024-01-10" },
        { name: "Fundo Ações Itaú", type: "funds", institution: "Itaú", initialAmount: "30000.00", expectedReturn: "16.80", startDate: "2024-02-01" },
        { name: "Fundo DI Bradesco", type: "funds", institution: "Bradesco", initialAmount: "22000.00", expectedReturn: "12.30", startDate: "2024-01-22" },
        { name: "Fundo Internacional BTG", type: "funds", institution: "BTG Pactual", initialAmount: "35000.00", expectedReturn: "15.90", startDate: "2024-03-05" },
        
        // Cryptocurrency (Conservative)
        { name: "Bitcoin (BTC)", type: "crypto", institution: "Binance", initialAmount: "8000.00", expectedReturn: "45.60", startDate: "2024-02-12" },
        { name: "Ethereum (ETH)", type: "crypto", institution: "Binance", initialAmount: "5000.00", expectedReturn: "38.20", startDate: "2024-02-18" },
        
        // Private Pension
        { name: "Previdência PGBL Brasilprev", type: "pension", institution: "Brasilprev", initialAmount: "1500.00", expectedReturn: "8.90", startDate: "2024-01-01" },
        { name: "Previdência VGBL Itaú", type: "pension", institution: "Itaú", initialAmount: "2000.00", expectedReturn: "9.20", startDate: "2024-01-01" },
      ];

      for (const inv of investments) {
        await this.createInvestment({
          userId,
          ...inv
        });
      }

      // Create comprehensive financial goals
      const goals = [
        // Emergency & Security
        { name: "Fundo de Emergência", targetAmount: "60000.00", currentAmount: "32500.00", targetDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "emergency" },
        { name: "Seguro de Vida", targetAmount: "5000.00", currentAmount: "2800.00", targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "insurance" },
        
        // Travel & Leisure
        { name: "Viagem Europa", targetAmount: "25000.00", currentAmount: "14200.00", targetDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "vacation" },
        { name: "Férias Nordeste", targetAmount: "8000.00", currentAmount: "4500.00", targetDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "vacation" },
        { name: "Equipamentos Fotografia", targetAmount: "12000.00", currentAmount: "6700.00", targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "hobby" },
        
        // Transportation
        { name: "Carro Novo", targetAmount: "85000.00", currentAmount: "45600.00", targetDate: new Date(Date.now() + 450 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "car" },
        { name: "Moto", targetAmount: "18000.00", currentAmount: "8900.00", targetDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "transportation" },
        
        // Real Estate
        { name: "Entrada Apartamento", targetAmount: "120000.00", currentAmount: "67500.00", targetDate: new Date(Date.now() + 720 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "real_estate" },
        { name: "Reforma Casa", targetAmount: "35000.00", currentAmount: "18200.00", targetDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "home_improvement" },
        
        // Education & Career
        { name: "MBA Executivo", targetAmount: "45000.00", currentAmount: "22100.00", targetDate: new Date(Date.now() + 360 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "education" },
        { name: "Curso de Inglês", targetAmount: "8000.00", currentAmount: "5200.00", targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "education" },
        
        // Investment & Retirement
        { name: "Carteira de Ações", targetAmount: "100000.00", currentAmount: "58900.00", targetDate: new Date(Date.now() + 600 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "investment" },
        { name: "Previdência Privada", targetAmount: "500000.00", currentAmount: "125600.00", targetDate: new Date(Date.now() + 7300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "retirement" },
        
        // Health & Wellness
        { name: "Plano de Saúde Premium", targetAmount: "15000.00", currentAmount: "8700.00", targetDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "health" },
        { name: "Academia Home Office", targetAmount: "12000.00", currentAmount: "6800.00", targetDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "fitness" },
        
        // Business & Entrepreneurship
        { name: "Startup Capital", targetAmount: "200000.00", currentAmount: "89400.00", targetDate: new Date(Date.now() + 540 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "business" },
        { name: "Equipamentos Trabalho", targetAmount: "25000.00", currentAmount: "16200.00", targetDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "professional" },
      ];

      for (const goal of goals) {
        await this.createFinancialGoal({
          userId,
          ...goal
        });
      }

      // Create AI predictions and insights
      const currentDate = new Date();
      const futureDate = new Date(currentDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

      const predictions = [
        {
          type: "expense_forecast",
          predictionData: JSON.stringify({
            description: "Gastos com alimentação podem aumentar 15% nos próximos 3 meses devido ao padrão sazonal observado.",
            recommendation: "Considere aumentar o orçamento de alimentação ou buscar alternativas mais econômicas.",
            severity: "medium",
            estimatedImpact: 240.50
          }),
          confidence: "87.00",
          validFrom: currentDate.toISOString().split('T')[0],
          validTo: futureDate.toISOString().split('T')[0]
        },
        {
          type: "budget_alert",
          predictionData: JSON.stringify({
            description: "Orçamento de transporte está 85% utilizado com 10 dias restantes no mês.",
            recommendation: "Avalie o uso de transporte público ou carona para reduzir gastos.",
            severity: "high",
            estimatedImpact: 180.00
          }),
          confidence: "92.00",
          validFrom: currentDate.toISOString().split('T')[0],
          validTo: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          type: "investment_suggestion",
          predictionData: JSON.stringify({
            description: "Baseado no seu perfil, diversificar em fundos imobiliários pode otimizar retornos.",
            recommendation: "Considere alocar 20% da carteira em FIIs com bom histórico de dividendos.",
            severity: "low",
            estimatedImpact: 2400.00
          }),
          confidence: "78.00",
          validFrom: currentDate.toISOString().split('T')[0],
          validTo: futureDate.toISOString().split('T')[0]
        },
        {
          type: "anomaly_detection",
          predictionData: JSON.stringify({
            description: "Gasto incomum de R$ 1.200 em 'Diversos' detectado em 15/01/2025.",
            recommendation: "Verifique se esta transação está correta e categorizada adequadamente.",
            severity: "high",
            estimatedImpact: 1200.00
          }),
          confidence: "94.00",
          validFrom: currentDate.toISOString().split('T')[0],
          validTo: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          type: "expense_forecast",
          predictionData: JSON.stringify({
            description: "Tendência de aumento em gastos com saúde baseada nos últimos 6 meses.",
            recommendation: "Considere revisar o plano de saúde ou criar uma reserva específica para emergências médicas.",
            severity: "medium",
            estimatedImpact: 450.00
          }),
          confidence: "81.00",
          validFrom: currentDate.toISOString().split('T')[0],
          validTo: futureDate.toISOString().split('T')[0]
        }
      ];

      for (const prediction of predictions) {
        await this.createAiPrediction({
          userId,
          ...prediction
        });
      }

    } catch (error) {
      console.error("Error generating test data:", error);
      throw error;
    }
  }

  // Helper method to generate monthly fixed expenses
  private async generateMonthlyFixedExpenses(userId: number, currentDate: Date, categories: any[], accounts: any[]) {
    const getCategoryByName = (name: string) => categories.find(c => c.name === name);
    const getAccountByType = (preferredTypes: string[]) => {
      const preferredAccounts = accounts.filter(acc => preferredTypes.includes(acc.type));
      return preferredAccounts.length > 0 ? 
        preferredAccounts[Math.floor(Math.random() * preferredAccounts.length)] :
        accounts[Math.floor(Math.random() * accounts.length)];
    };

    // Monthly fixed bills (always on specific days)
    const fixedExpenses = [
      { category: "Aluguel", amount: 2200, day: 10, description: "Aluguel mensal - Apartamento" },
      { category: "Condomínio", amount: 380, day: 15, description: "Taxa de condomínio" },
      { category: "Energia Elétrica", amount: 180 + Math.random() * 120, day: 8, description: "Conta de luz - ENEL" },
      { category: "Água", amount: 65 + Math.random() * 50, day: 12, description: "Conta de água - SABESP" },
      { category: "Internet", amount: 119.90, day: 5, description: "Internet - Vivo Fibra 300MB" },
      { category: "Telefone", amount: 89.90, day: 7, description: "Plano móvel - Tim" },
      { category: "Plano de Saúde", amount: 450 + Math.random() * 100, day: 3, description: "Plano de saúde - Amil" },
      { category: "Seguro Auto", amount: 165, day: 20, description: "Seguro do carro - Porto Seguro" },
      { category: "Academia", amount: 149.90, day: 1, description: "Mensalidade academia - SmartFit" },
      { category: "Streaming", amount: 35.90, day: 14, description: "Netflix Premium" },
      { category: "IPTU", amount: 245, day: 25, description: "IPTU - Parcela mensal", skipMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, // Only Nov, Dec, Jan
    ];

    for (const expense of fixedExpenses) {
      // Skip expenses that shouldn't occur in certain months
      if (expense.skipMonths && expense.skipMonths.includes(currentDate.getMonth())) {
        continue;
      }

      const category = getCategoryByName(expense.category);
      if (category) {
        await this.createTransaction({
          userId,
          accountId: getAccountByType(['checking']).id,
          categoryId: category.id,
          title: expense.description,
          amount: (-(typeof expense.amount === 'number' ? expense.amount : expense.amount)).toFixed(2), // Make negative
          description: expense.description,
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), expense.day).toISOString().split('T')[0],
          type: "expense"
        });
      }
    }
  }

  // Helper method to generate weekly recurring expenses
  private async generateWeeklyExpenses(userId: number, currentDate: Date, categories: any[], accounts: any[]) {
    const getCategoryByName = (name: string) => categories.find(c => c.name === name);
    const getAccountByType = (preferredTypes: string[]) => {
      const preferredAccounts = accounts.filter(acc => preferredTypes.includes(acc.type));
      return preferredAccounts.length > 0 ? 
        preferredAccounts[Math.floor(Math.random() * preferredAccounts.length)] :
        accounts[Math.floor(Math.random() * accounts.length)];
    };

    // Weekly groceries (Saturdays)
    for (let week = 0; week < 4; week++) {
      const saturday = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1 + (week * 7) + 5);
      if (saturday.getMonth() === currentDate.getMonth()) {
        const supermarketCategory = getCategoryByName("Supermercado");
        if (supermarketCategory) {
          const amount = 180 + Math.random() * 220; // 180-400
          const stores = ["Pão de Açúcar", "Carrefour", "Extra", "Walmart", "Atacadão"];
          const store = stores[Math.floor(Math.random() * stores.length)];
          
          await this.createTransaction({
            userId,
            accountId: getAccountByType(['checking', 'credit_card']).id,
            categoryId: supermarketCategory.id,
            title: `Compras da semana - ${store}`,
            amount: amount.toFixed(2),
            description: `Compras semanais no ${store}`,
            date: saturday.toISOString().split('T')[0],
            type: "expense"
          });
        }
      }
    }

    // Weekly gas (random weekday)
    const gasCategory = getCategoryByName("Combustível");
    if (gasCategory && Math.random() > 0.3) { // 70% chance per month
      const randomDay = 3 + Math.floor(Math.random() * 20);
      const gasAmount = 120 + Math.random() * 80; // 120-200
      
      await this.createTransaction({
        userId,
        accountId: getAccountByType(['checking', 'credit_card']).id,
        categoryId: gasCategory.id,
        title: "Abastecimento",
        amount: gasAmount.toFixed(2),
        description: "Combustível - Posto Shell",
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), randomDay).toISOString().split('T')[0],
        type: "expense"
      });
    }
  }

  // Helper method to generate daily variable expenses
  private async generateDailyExpense(userId: number, currentDate: Date, day: number, categories: any[], accounts: any[], isWeekend: boolean) {
    const getCategoryByName = (name: string) => categories.find(c => c.name === name);
    const getAccountByType = (preferredTypes: string[]) => {
      const preferredAccounts = accounts.filter(acc => preferredTypes.includes(acc.type));
      return preferredAccounts.length > 0 ? 
        preferredAccounts[Math.floor(Math.random() * preferredAccounts.length)] :
        accounts[Math.floor(Math.random() * accounts.length)];
    };

    const expenseTypes = [
      // Food & Dining
      {
        categories: ["Restaurantes", "Alimentação"],
        amounts: isWeekend ? [40, 120] : [15, 80],
        descriptions: isWeekend ? 
          ["Almoço em família", "Jantar especial", "Brunch", "Happy hour"] :
          ["Lanche da tarde", "Delivery almoço", "Café da manhã", "Padaria"],
        accounts: ['checking', 'credit_card']
      },
      // Transportation
      {
        categories: ["Uber/Taxi", "Transporte Público"],
        amounts: [8, 45],
        descriptions: ["Corrida Uber", "99Pop", "Ônibus", "Metrô", "Estacionamento"],
        accounts: ['checking']
      },
      // Shopping & Personal
      {
        categories: ["Vestuário", "Beleza", "Farmácia"],
        amounts: [25, 200],
        descriptions: ["Compras roupa", "Produtos beleza", "Medicamentos", "Cosmético", "Perfume"],
        accounts: ['credit_card']
      },
      // Entertainment
      {
        categories: ["Cinema", "Lazer"],
        amounts: isWeekend ? [30, 150] : [20, 80],
        descriptions: isWeekend ? 
          ["Cinema", "Teatro", "Show", "Balada", "Parque"] :
          ["Café", "Revista", "Jogo", "App"],
        accounts: ['credit_card', 'checking']
      },
      // Health & Fitness
      {
        categories: ["Consultas", "Farmácia", "Exames"],
        amounts: [35, 300],
        descriptions: ["Consulta médica", "Dentista", "Exame sangue", "Fisioterapia", "Medicamento"],
        accounts: ['checking']
      },
      // Misc & Utilities
      {
        categories: ["Diversos", "Pets"],
        amounts: [15, 150],
        descriptions: ["Compras casa", "Produtos pet", "Papelaria", "Presente", "Serviços"],
        accounts: ['checking', 'credit_card']
      }
    ];

    const selectedType = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
    const categoryName = selectedType.categories[Math.floor(Math.random() * selectedType.categories.length)];
    const category = getCategoryByName(categoryName);
    
    if (category) {
      const amount = selectedType.amounts[0] + Math.random() * (selectedType.amounts[1] - selectedType.amounts[0]);
      const description = selectedType.descriptions[Math.floor(Math.random() * selectedType.descriptions.length)];
      
      await this.createTransaction({
        userId,
        accountId: getAccountByType(selectedType.accounts).id,
        categoryId: category.id,
        title: description,
        amount: amount.toFixed(2),
        description: description,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0],
        type: "expense"
      });
    }
  }

  // Helper method to generate realistic expense titles
  private generateExpenseTitle(categoryName: string): string {
    const titles: Record<string, string[]> = {
      "Alimentação": ["Supermercado Pão de Açúcar", "Carrefour", "Extra", "Atacadão", "Hortifruti"],
      "Supermercado": ["Compras da semana", "Mercado local", "Feira livre", "Açougue Premium"],
      "Restaurantes": ["Outback Steakhouse", "McDonald's", "Subway", "Pizza Hut", "iFood"],
      "Transporte": ["Posto Shell", "Uber", "99Taxi", "Passagem ônibus", "Estacionamento"],
      "Combustível": ["Posto BR", "Shell Select", "Ipiranga", "Petrobras"],
      "Uber/Taxi": ["Corrida Uber", "99Pop", "Taxi Amarelo"],
      "Vestuário": ["C&A", "Renner", "Zara", "H&M", "Riachuelo"],
      "Lazer": ["Cinema Cinemark", "Netflix", "Spotify", "Amazon Prime"],
      "Farmácia": ["Drogasil", "Droga Raia", "Pague Menos", "Ultrafarma"],
      "Saúde": ["Consulta médica", "Exame laboratório", "Fisioterapia"],
      "Educação": ["Udemy", "Coursera", "Livros técnicos", "Material escolar"],
      "Diversos": ["Loja de conveniência", "Padaria", "Banca de jornal", "Compra online"]
    };

    const categoryTitles = titles[categoryName] || titles["Diversos"];
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
  }

  async clearAllData(userId: number): Promise<void> {
    try {
      // Delete in correct order to avoid foreign key constraints
      await db.delete(aiPredictions).where(eq(aiPredictions.userId, userId));
      await db.delete(financialGoals).where(eq(financialGoals.userId, userId));
      await db.delete(investments).where(eq(investments.userId, userId));
      await db.delete(budgets).where(eq(budgets.userId, userId));
      await db.delete(transactions).where(eq(transactions.userId, userId));
      await db.delete(categories).where(eq(categories.userId, userId));
      await db.delete(accounts).where(eq(accounts.userId, userId));
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    }
  }

  async exportDatabaseBackup(userId: number): Promise<string> {
    try {
      // Get all user data
      const accounts = await this.getAccounts(userId);
      const categories = await this.getCategories(userId);
      const transactions = await this.getTransactions(userId, 10000); // Get all transactions
      const budgets = await this.getBudgets(userId);
      const investments = await this.getInvestments(userId);
      const goals = await this.getFinancialGoals(userId);
      const predictions = await this.getAiPredictions(userId);

      // Create SQL backup with proper escaping
      let sql = `-- FinanceApp Database Backup for User ${userId}\n`;
      sql += `-- Generated on ${new Date().toISOString()}\n\n`;
      
      // Clear existing data for this user
      sql += `-- Clear existing user data\n`;
      sql += `DELETE FROM ai_predictions WHERE user_id = ${userId};\n`;
      sql += `DELETE FROM financial_goals WHERE user_id = ${userId};\n`;
      sql += `DELETE FROM investments WHERE user_id = ${userId};\n`;
      sql += `DELETE FROM budgets WHERE user_id = ${userId};\n`;
      sql += `DELETE FROM transactions WHERE user_id = ${userId};\n`;
      sql += `DELETE FROM categories WHERE user_id = ${userId};\n`;
      sql += `DELETE FROM accounts WHERE user_id = ${userId};\n\n`;

      // Insert accounts
      if (accounts.length > 0) {
        sql += `-- Accounts\n`;
        for (const account of accounts) {
          sql += `INSERT INTO accounts (user_id, name, type, balance, created_at) VALUES (${userId}, '${account.name.replace(/'/g, "''")}', '${account.type}', ${account.balance}, '${account.createdAt?.toISOString() || new Date().toISOString()}');\n`;
        }
        sql += `\n`;
      }

      // Insert categories
      if (categories.length > 0) {
        sql += `-- Categories\n`;
        for (const category of categories) {
          sql += `INSERT INTO categories (user_id, name, type, color, created_at) VALUES (${userId}, '${category.name.replace(/'/g, "''")}', '${category.type}', '${category.color || '#808080'}', '${category.createdAt?.toISOString() || new Date().toISOString()}');\n`;
        }
        sql += `\n`;
      }

      // Insert budgets
      if (budgets.length > 0) {
        sql += `-- Budgets\n`;
        for (const budget of budgets) {
          sql += `INSERT INTO budgets (user_id, category_id, name, amount, period, start_date, end_date, created_at) VALUES (${userId}, (SELECT id FROM categories WHERE user_id = ${userId} AND name = '${categories.find(c => c.id === budget.categoryId)?.name?.replace(/'/g, "''") || ''}' LIMIT 1), '${budget.name.replace(/'/g, "''")}', ${budget.amount}, '${budget.period}', '${budget.startDate}', ${budget.endDate ? `'${budget.endDate}'` : 'NULL'}, '${budget.createdAt?.toISOString() || new Date().toISOString()}');\n`;
        }
        sql += `\n`;
      }

      // Insert investments
      if (investments.length > 0) {
        sql += `-- Investments\n`;
        for (const investment of investments) {
          sql += `INSERT INTO investments (user_id, name, type, institution, initial_amount, current_amount, expected_return, start_date, created_at) VALUES (${userId}, '${investment.name.replace(/'/g, "''")}', '${investment.type}', '${investment.institution.replace(/'/g, "''")}', ${investment.initialAmount}, ${investment.currentAmount || investment.initialAmount}, '${investment.expectedReturn}', '${investment.startDate}', '${investment.createdAt?.toISOString() || new Date().toISOString()}');\n`;
        }
        sql += `\n`;
      }

      // Insert financial goals
      if (goals.length > 0) {
        sql += `-- Financial Goals\n`;
        for (const goal of goals) {
          sql += `INSERT INTO financial_goals (user_id, name, target_amount, current_amount, target_date, category, is_active, created_at) VALUES (${userId}, '${goal.name.replace(/'/g, "''")}', ${goal.targetAmount}, ${goal.currentAmount}, '${goal.targetDate}', '${goal.category}', ${goal.isActive !== false}, '${goal.createdAt?.toISOString() || new Date().toISOString()}');\n`;
        }
        sql += `\n`;
      }

      // Insert AI predictions
      if (predictions.length > 0) {
        sql += `-- AI Predictions\n`;
        for (const prediction of predictions) {
          sql += `INSERT INTO ai_predictions (user_id, type, category_id, prediction_data, confidence, valid_from, valid_to, is_active, created_at) VALUES (${userId}, '${prediction.type}', ${prediction.categoryId || 'NULL'}, '${prediction.predictionData.replace(/'/g, "''")}', '${prediction.confidence || '0.00'}', '${prediction.validFrom}', '${prediction.validTo}', ${prediction.isActive !== false}, '${prediction.createdAt?.toISOString() || new Date().toISOString()}');\n`;
        }
        sql += `\n`;
      }

      sql += `-- Backup completed\n`;
      return sql;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create database backup');
    }
  }

  async importDatabaseBackup(userId: number, sqlContent: string): Promise<void> {
    try {
      // Clear existing data first
      await this.clearAllData(userId);

      // Split SQL content into individual statements
      const statements = sqlContent
        .split('\n')
        .filter(line => line.trim() && !line.trim().startsWith('--'))
        .join(' ')
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      // Execute each statement
      for (const statement of statements) {
        try {
          await db.execute(sql.raw(statement));
        } catch (lineError) {
          console.warn('Warning: Could not execute statement:', statement.substring(0, 100), lineError);
          // Continue with other statements
        }
      }
    } catch (error) {
      console.error('Error importing backup:', error);
      throw new Error('Failed to import database backup');
    }
  }

  // Notification State operations
  async getNotificationStates(userId: number): Promise<UserNotificationState[]> {
    return await db
      .select()
      .from(userNotificationStates)
      .where(eq(userNotificationStates.userId, userId))
      .orderBy(desc(userNotificationStates.createdAt));
  }

  async updateNotificationState(
    userId: number, 
    notificationId: string, 
    updates: { isRead?: boolean; isDismissed?: boolean }
  ): Promise<UserNotificationState> {
    // Check if record exists
    const existing = await db
      .select()
      .from(userNotificationStates)
      .where(
        and(
          eq(userNotificationStates.userId, userId),
          eq(userNotificationStates.notificationId, notificationId)
        )
      );

    const now = new Date();
    const updateData: any = {};

    if (updates.isRead !== undefined) {
      updateData.isRead = updates.isRead;
      updateData.readAt = updates.isRead ? now : null;
    }

    if (updates.isDismissed !== undefined) {
      updateData.isDismissed = updates.isDismissed;
      updateData.dismissedAt = updates.isDismissed ? now : null;
    }

    if (existing.length > 0) {
      // Update existing record
      const [updated] = await db
        .update(userNotificationStates)
        .set(updateData)
        .where(
          and(
            eq(userNotificationStates.userId, userId),
            eq(userNotificationStates.notificationId, notificationId)
          )
        )
        .returning();
      return updated;
    } else {
      // Create new record
      const insertData: InsertUserNotificationState = {
        userId,
        notificationId,
        isRead: updates.isRead ?? false,
        isDismissed: updates.isDismissed ?? false,
        readAt: updates.isRead ? now : undefined,
        dismissedAt: updates.isDismissed ? now : undefined,
      };

      const [created] = await db
        .insert(userNotificationStates)
        .values(insertData)
        .returning();
      return created;
    }
  }

  async markNotificationAsRead(userId: number, notificationId: string): Promise<void> {
    await this.updateNotificationState(userId, notificationId, { isRead: true });
  }

  async markNotificationAsDismissed(userId: number, notificationId: string): Promise<void> {
    await this.updateNotificationState(userId, notificationId, { isDismissed: true });
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const now = new Date();
    
    // Get all notification IDs that exist for this user (from generated notifications)
    // Since we generate notifications in the hook, we need to mark them all as read
    // We'll handle this by updating all existing records and letting the hook handle the rest
    await db
      .update(userNotificationStates)
      .set({ 
        isRead: true, 
        readAt: now 
      })
      .where(
        and(
          eq(userNotificationStates.userId, userId),
          eq(userNotificationStates.isRead, false)
        )
      );
  }
}

export const storage = new DatabaseStorage();
