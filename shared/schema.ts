import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull().default("user"), // 'admin' or 'user'
  securityPhrase: text("security_phrase"), // For password recovery
  onboardingCompleted: boolean("onboarding_completed").default(false),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Account types
export const accountTypes = pgTable("account_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'bank', 'credit_card'
});

// Accounts (bank accounts and credit cards)
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'checking', 'savings', 'credit_card'
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }),
  closingDay: integer("closing_day"), // for credit cards
  dueDay: integer("due_day"), // for credit cards
  domain: text("domain"), // Bank domain for logo (e.g., nubank.com.br)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'income', 'expense'
  color: text("color").default("#1E40AF"),
  icon: text("icon").default("Tag"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  title: text("title").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'income', 'expense', 'transfer'
  description: text("description"),
  date: date("date").notNull(),
  dueDate: date("due_date"),
  paidDate: date("paid_date"),
  isPaid: boolean("is_paid").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurrenceType: text("recurrence_type"), // 'daily', 'weekly', 'monthly', 'yearly'
  recurrenceInterval: integer("recurrence_interval").default(1),
  recurrenceEndDate: date("recurrence_end_date"),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Budgets
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  period: text("period").notNull(), // 'monthly', 'yearly'
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Investments
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'stocks', 'bonds', 'funds', 'crypto', 'real_estate'
  institution: text("institution").notNull(),
  initialAmount: decimal("initial_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }),
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }), // percentage
  startDate: date("start_date").notNull(),
  maturityDate: date("maturity_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial goals
export const financialGoals = pgTable("financial_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0.00"),
  targetDate: date("target_date").notNull(),
  category: text("category").notNull(), // 'emergency', 'vacation', 'house', 'car', 'retirement'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Predictions
export const aiPredictions = pgTable("ai_predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'expense_forecast', 'anomaly_detection', 'budget_alert'
  categoryId: integer("category_id").references(() => categories.id),
  predictionData: text("prediction_data").notNull(), // JSON string with prediction details
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // confidence percentage
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Notification States
export const userNotificationStates = pgTable("user_notification_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  notificationId: text("notification_id").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isDismissed: boolean("is_dismissed").default(false).notNull(),
  readAt: timestamp("read_at"),
  dismissedAt: timestamp("dismissed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
  investments: many(investments),
  financialGoals: many(financialGoals),
  aiPredictions: many(aiPredictions),
  notificationStates: many(userNotificationStates),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  transactions: many(transactions),
  budgets: many(budgets),
  aiPredictions: many(aiPredictions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  category: one(categories, { fields: [budgets.categoryId], references: [categories.id] }),
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  user: one(users, { fields: [investments.userId], references: [users.id] }),
}));

export const financialGoalsRelations = relations(financialGoals, ({ one }) => ({
  user: one(users, { fields: [financialGoals.userId], references: [users.id] }),
}));

export const aiPredictionsRelations = relations(aiPredictions, ({ one }) => ({
  user: one(users, { fields: [aiPredictions.userId], references: [users.id] }),
  category: one(categories, { fields: [aiPredictions.categoryId], references: [categories.id] }),
}));

export const userNotificationStatesRelations = relations(userNotificationStates, ({ one }) => ({
  user: one(users, { fields: [userNotificationStates.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true, createdAt: true });
export const insertInvestmentSchema = createInsertSchema(investments).omit({ id: true, createdAt: true });
export const insertFinancialGoalSchema = createInsertSchema(financialGoals).omit({ id: true, createdAt: true });
export const insertAiPredictionSchema = createInsertSchema(aiPredictions).omit({ id: true, createdAt: true });
export const insertUserNotificationStateSchema = createInsertSchema(userNotificationStates).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type FinancialGoal = typeof financialGoals.$inferSelect;
export type InsertFinancialGoal = z.infer<typeof insertFinancialGoalSchema>;
export type AiPrediction = typeof aiPredictions.$inferSelect;
export type InsertAiPrediction = z.infer<typeof insertAiPredictionSchema>;
export type UserNotificationState = typeof userNotificationStates.$inferSelect;
export type InsertUserNotificationState = z.infer<typeof insertUserNotificationStateSchema>;
