import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAccountSchema, insertCategorySchema, insertTransactionSchema, insertBudgetSchema, insertInvestmentSchema, insertFinancialGoalSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

// Extend session type to include userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const MemoryStoreConstructor = MemoryStore(session);

// Simple session middleware
function setupSession(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreConstructor({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: false, // set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  }));
}

// Auth middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupSession(app);

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.validateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/me', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          userType: user.userType,
          onboardingCompleted: user.onboardingCompleted 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Register route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password, securityPhrase } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const userData = {
        username,
        email,
        password,
        securityPhrase: securityPhrase || null,
        userType: "user" as const,
        onboardingCompleted: false
      };

      const user = await storage.createUser(userData);
      
      // Auto-login after registration
      req.session.userId = user.id;
      
      res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          userType: user.userType,
          onboardingCompleted: user.onboardingCompleted 
        } 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Password reset route
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { email, securityPhrase, newPassword } = req.body;
      
      if (!email || !securityPhrase || !newPassword) {
        return res.status(400).json({ message: "Email, security phrase, and new password are required" });
      }

      const success = await storage.resetPassword(email, securityPhrase, newPassword);
      
      if (success) {
        res.json({ message: "Password reset successfully" });
      } else {
        res.status(400).json({ message: "Invalid email or security phrase" });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Password reset failed" });
    }
  });

  // Dashboard route
  app.get('/api/dashboard', requireAuth, async (req: any, res) => {
    try {
      const dashboardData = await storage.getDashboardData(req.session.userId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Filtered Dashboard route
  app.post('/api/dashboard/filtered', requireAuth, async (req: any, res) => {
    try {
      const filters = req.body;
      const dashboardData = await storage.getFilteredDashboardData(req.session.userId, filters);
      res.json(dashboardData);
    } catch (error) {
      console.error("Filtered Dashboard error:", error);
      res.status(500).json({ message: "Failed to fetch filtered dashboard data" });
    }
  });

  // Account routes
  app.get('/api/accounts', requireAuth, async (req: any, res) => {
    try {
      const accounts = await storage.getAccounts(req.session.userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post('/api/accounts', requireAuth, async (req: any, res) => {
    try {
      console.log("Received account data:", req.body);
      console.log("User ID:", req.session.userId);
      
      const accountData = insertAccountSchema.parse({ ...req.body, userId: req.session.userId });
      console.log("Parsed account data:", accountData);
      
      const account = await storage.createAccount(accountData);
      res.json(account);
    } catch (error) {
      console.error("Account creation error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      res.status(400).json({ message: "Invalid account data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put('/api/accounts/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const accountData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(id, accountData);
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: "Invalid account data" });
    }
  });

  app.patch('/api/accounts/:id', requireAuth, async (req: any, res) => {
    try {
      console.log("PATCH Received account data:", req.body);
      console.log("PATCH User ID:", req.session.userId);
      console.log("PATCH Account ID:", req.params.id);
      
      const id = parseInt(req.params.id);
      const accountData = insertAccountSchema.partial().parse(req.body);
      console.log("PATCH Parsed account data:", accountData);
      
      const account = await storage.updateAccount(id, accountData);
      res.json(account);
    } catch (error) {
      console.error("PATCH Account update error:", error);
      if (error instanceof Error) {
        console.error("PATCH Error message:", error.message);
        console.error("PATCH Error stack:", error.stack);
      }
      res.status(400).json({ message: "Invalid account data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete('/api/accounts/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAccount(id, req.session.userId);
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Category routes
  app.get('/api/categories', requireAuth, async (req: any, res) => {
    try {
      const categories = await storage.getCategories(req.session.userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', requireAuth, async (req: any, res) => {
    try {
      const categoryData = insertCategorySchema.parse({ ...req.body, userId: req.session.userId });
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.put('/api/categories/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.delete('/api/categories/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id, req.session.userId);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', requireAuth, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const transactions = await storage.getTransactions(req.session.userId, limit, offset);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get liquid amount (filtered by date if provided)
  app.get('/api/transactions/liquid-amount', requireAuth, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      let transactions;

      if (startDate && endDate) {
        transactions = await storage.getTransactionsByDateRange(req.session.userId, startDate, endDate);
      } else {
        transactions = await storage.getTransactions(req.session.userId, 10000, 0); // Get all transactions
      }
      
      const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0); // Expenses are negative

      const liquidAmount = totalIncome + totalExpenses; // Add because expenses are negative

      res.json({ 
        liquidAmount,
        totalIncome,
        totalExpenses: Math.abs(totalExpenses), // Return positive for display
        transactionCount: transactions.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate liquid amount" });
    }
  });

  app.post('/api/transactions', requireAuth, async (req: any, res) => {
    try {
      const transactionData = insertTransactionSchema.parse({ ...req.body, userId: req.session.userId });
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Transaction creation error:", error);
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.put('/api/transactions/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, transactionData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.delete('/api/transactions/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTransaction(id, req.session.userId);
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Budget routes
  app.get('/api/budgets', requireAuth, async (req: any, res) => {
    try {
      const budgets = await storage.getBudgets(req.session.userId);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post('/api/budgets', requireAuth, async (req: any, res) => {
    try {
      const budgetData = insertBudgetSchema.parse({ ...req.body, userId: req.session.userId });
      const budget = await storage.createBudget(budgetData);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ message: "Invalid budget data" });
    }
  });

  app.put('/api/budgets/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const budgetData = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(id, budgetData);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ message: "Invalid budget data" });
    }
  });

  app.delete('/api/budgets/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBudget(id, req.session.userId);
      res.json({ message: "Budget deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  // Investment routes
  app.get('/api/investments', requireAuth, async (req: any, res) => {
    try {
      const investments = await storage.getInvestments(req.session.userId);
      res.json(investments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  app.post('/api/investments', requireAuth, async (req: any, res) => {
    try {
      const investmentData = insertInvestmentSchema.parse({ ...req.body, userId: req.session.userId });
      const investment = await storage.createInvestment(investmentData);
      res.json(investment);
    } catch (error) {
      res.status(400).json({ message: "Invalid investment data" });
    }
  });

  app.put('/api/investments/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const investmentData = insertInvestmentSchema.partial().parse(req.body);
      const investment = await storage.updateInvestment(id, investmentData);
      res.json(investment);
    } catch (error) {
      res.status(400).json({ message: "Invalid investment data" });
    }
  });

  app.delete('/api/investments/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInvestment(id, req.session.userId);
      res.json({ message: "Investment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete investment" });
    }
  });

  // Financial Goals routes
  app.get('/api/financial-goals', requireAuth, async (req: any, res) => {
    try {
      const goals = await storage.getFinancialGoals(req.session.userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial goals" });
    }
  });

  app.post('/api/financial-goals', requireAuth, async (req: any, res) => {
    try {
      const goalData = insertFinancialGoalSchema.parse({ ...req.body, userId: req.session.userId });
      const goal = await storage.createFinancialGoal(goalData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid financial goal data" });
    }
  });

  // AI Predictions routes
  app.get('/api/ai-predictions', requireAuth, async (req: any, res) => {
    try {
      const predictions = await storage.getAiPredictions(req.session.userId);
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI predictions" });
    }
  });

  // Settings routes
  app.post('/api/settings/generate-data', requireAuth, async (req: any, res) => {
    try {
      await storage.generateTestData(req.session.userId);
      res.json({ message: "Test data generated successfully" });
    } catch (error) {
      console.error("Generate data error:", error);
      res.status(500).json({ message: "Failed to generate test data" });
    }
  });

  app.delete('/api/settings/clear-data', requireAuth, async (req: any, res) => {
    try {
      await storage.clearAllData(req.session.userId);
      res.json({ message: "All data cleared successfully" });
    } catch (error) {
      console.error("Clear data error:", error);
      res.status(500).json({ message: "Failed to clear data" });
    }
  });

  app.get('/api/settings/backup', requireAuth, async (req: any, res) => {
    try {
      const sqlBackup = await storage.exportDatabaseBackup(req.session.userId);
      const filename = `financeapp_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(sqlBackup);
    } catch (error) {
      console.error("Backup error:", error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });

  app.post('/api/settings/import', requireAuth, async (req: any, res) => {
    try {
      const { sqlContent } = req.body;
      
      if (!sqlContent) {
        return res.status(400).json({ message: "SQL content is required" });
      }

      await storage.importDatabaseBackup(req.session.userId, sqlContent);
      res.json({ message: "Database imported successfully" });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ message: "Failed to import database" });
    }
  });

  // Notification state routes
  app.get('/api/notification-states', requireAuth, async (req: any, res) => {
    try {
      const states = await storage.getNotificationStates(req.session.userId);
      res.json(states);
    } catch (error) {
      console.error('Error fetching notification states:', error);
      res.status(500).json({ error: 'Failed to fetch notification states' });
    }
  });

  app.post('/api/notification-states/:notificationId/read', requireAuth, async (req: any, res) => {
    try {
      const { notificationId } = req.params;
      await storage.markNotificationAsRead(req.session.userId, notificationId);
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  app.post('/api/notification-states/:notificationId/dismiss', requireAuth, async (req: any, res) => {
    try {
      const { notificationId } = req.params;
      await storage.markNotificationAsDismissed(req.session.userId, notificationId);
      res.json({ message: 'Notification dismissed' });
    } catch (error) {
      console.error('Error dismissing notification:', error);
      res.status(500).json({ error: 'Failed to dismiss notification' });
    }
  });

  app.post('/api/notification-states/mark-all-read', requireAuth, async (req: any, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.session.userId);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  });

  // Onboarding routes
  app.post('/api/onboarding/complete', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.markOnboardingCompleted(req.session.userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
