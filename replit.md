# FinanceApp - Personal Finance Management System

## Overview

FinanceApp is a comprehensive personal finance management web application built with a modern full-stack architecture. The system allows users to track accounts, transactions, categories, budgets, investments, and provides AI-powered financial analytics and predictions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for RESTful API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: Express-session with memory store
- **Authentication**: Session-based authentication with bcrypt password hashing

### Project Structure
- **Monorepo Layout**: Single repository with separate client, server, and shared directories
- **Client**: React frontend application
- **Server**: Express.js backend API
- **Shared**: Common TypeScript types and database schema definitions

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Management**: Centralized schema in `shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations
- **Connection**: Neon serverless with WebSocket support

### Authentication System
- **Session-based Authentication**: Using express-session middleware
- **Password Security**: bcrypt for password hashing
- **Session Storage**: Memory store with configurable expiration
- **Route Protection**: Authentication middleware for protected endpoints

### Financial Data Models
- **Users**: User accounts with authentication
- **Accounts**: Bank accounts and credit cards with balance tracking
- **Categories**: Income and expense categorization with color coding
- **Transactions**: Financial transactions with recurring transaction support
- **Budgets**: Budget planning and tracking by category
- **Investments**: Investment portfolio tracking
- **Financial Goals**: Goal setting and progress tracking
- **AI Predictions**: Machine learning predictions and analytics

### API Architecture
- **RESTful Design**: Standard HTTP methods and status codes
- **Route Organization**: Modular route handlers
- **Error Handling**: Centralized error handling middleware
- **Request Logging**: Comprehensive API request logging
- **Data Validation**: Zod schemas for request/response validation

### Frontend Components
- **Layout System**: Sidebar navigation with responsive design
- **Dashboard**: Real-time financial KPIs and charts
- **Forms**: Reusable form components with validation
- **Charts**: Custom canvas-based charts for financial visualization
- **UI Components**: Comprehensive design system using Shadcn/ui

## Data Flow

1. **User Authentication**: Session-based login with secure password handling
2. **Data Fetching**: TanStack Query manages server state with caching
3. **Form Submissions**: React Hook Form with Zod validation, then API calls
4. **Real-time Updates**: Query invalidation for immediate UI updates
5. **Error Handling**: Centralized error handling with user-friendly messages

## External Dependencies

### Production Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Framework**: Radix UI primitives for accessible components
- **Validation**: Zod for schema validation
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight routing

### Development Dependencies
- **Build Tools**: Vite for fast development and production builds
- **TypeScript**: Full TypeScript support across the stack
- **Development**: tsx for TypeScript execution in development

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **API Server**: Express server with live reload using tsx
- **Database**: Neon development database

### Production Build
- **Frontend**: Vite production build with optimization
- **Backend**: esbuild for server bundling
- **Deployment**: Single Node.js process serving both API and static files
- **Environment**: Production configuration with environment variables

### Key Features
- **Hot Module Replacement**: Fast development with Vite
- **TypeScript Compilation**: Full type checking across the stack
- **Asset Optimization**: Vite handles asset bundling and optimization
- **Environment Configuration**: Separate development and production configurations

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
- July 01, 2025. Added comprehensive Settings section with data generation and clearing functionality
- July 01, 2025. Implemented Portuguese Brazilian language support for UI elements
- July 01, 2025. Created realistic test data generation for all financial entities (accounts, transactions, categories, budgets, investments, goals)
- July 01, 2025. Made application fully mobile responsive with hamburger menu, adaptive layouts, and mobile-optimized components
- July 01, 2025. Expanded test data generator significantly with comprehensive Brazilian financial scenarios:
  * 40+ expense/income categories with realistic colors and names
  * 10 diverse bank accounts from major Brazilian institutions
  * 24+ investment types including stocks, bonds, FIIs, funds, crypto, and pension
  * 17 comprehensive financial goals across all life areas
  * AI predictions and insights for testing analytics features
  * Realistic monthly/weekly/daily expense patterns with Brazilian context
  * Fixed bills, recurring expenses, and variable spending with seasonal patterns
  * Comprehensive budget allocation for all major expense categories
- July 01, 2025. Fully reimplemented dashboard and financial management system:
  * Removed "Nova Transação" button from header - now available only in relevant sections
  * Complete advanced filtering system with contextual filters for each page
  * Visible filter tags/chips for easy management and removal
  * Separated account management: distinct sections for bank accounts vs credit cards
  * Enhanced credit card visualization with utilization tracking, alerts, and visual cards
  * New dedicated invoices page for credit card billing analysis
  * Comprehensive budget and goals management system
  * Enhanced transactions page with filtering, sorting, and detailed analytics
  * All currency, date, and input fields use proper PT-BR formatting
  * Improved UI/UX with better visual hierarchy and user experience
- July 02, 2025. Comprehensive application enhancement and structural improvements:
  * Structural Navigation: Removed Settings from sidebar, consolidated under Main Menu, Settings moved to user dropdown
  * Terminology: Renamed "Alerts" to "Notifications" throughout the system for consistency
  * Enhanced data generation with real-time progress tracking and 8-step detailed descriptions
  * Animated progress bar showing generation steps from categories to AI predictions
  * Detailed progress descriptions explaining exactly what's being generated
  * Step counter and percentage completion for better user feedback
  * UI/UX: Implemented custom global scrollbar with app visual identity
  * Tables: Added comprehensive data table component with pagination and column management
  * Invoice Functionality: Enhanced with "view details" and "analysis" dialogs, removed download buttons
  * Improved notification system with persistent read states and accurate badge counts
  * Mobile Responsiveness: Fixed horizontal overflow issues across all pages with mobile-safe containers
- July 02, 2025. Animated Financial Goal Progress Tracker Implementation:
  * Created comprehensive animated goal progress component with milestone celebrations
  * 6 distinct milestones (10%, 25%, 50%, 75%, 90%, 100%) with cute icons and animations
  * Full-screen celebration animations with floating particles and backdrop blur effects
  * Progress bars with visual milestone markers and hover interactions
  * Goal cards with priority badges, deadline tracking, and progress statistics
  * Quick-add buttons for incrementing goal progress (+R$100, +R$500)
  * Dedicated Goals page with form for creating/editing financial goals
  * Categories include: casa própria, viagem, educação, veículo, reserva, aposentadoria, negócio
  * Real-time animations using Framer Motion for smooth transitions and celebrations
  * Mobile-responsive design with stacked layouts and adaptive text sizing
- July 03, 2025. Enhanced Comprehensive Data Generation System:
  * Completely revamped data generation with monthly income and expense patterns
  * Comprehensive Brazilian account types: checking, savings, investment, credit cards
  * Realistic credit card data with proper limits, utilization, and due dates
  * Monthly fixed expenses: rent, utilities, insurance, health plans with realistic amounts
  * Credit card transaction generation with 5-15 transactions per month per card
  * Daily variable expenses with 40% probability and realistic merchant names
  * Installment payment scenarios for larger purchases with monthly installments
  * CORRECTED: Income values are always positive (salary, freelance, dividends, investment returns)
  * CORRECTED: Expense amounts are always negative with proper transaction categorization
  * Realistic Brazilian merchant names and transaction titles for authentic data
  * Enhanced transaction history covering 12 months of comprehensive financial activity
  * Fixed sign conventions: all income positive, all expenses negative for proper accounting
- July 05, 2025. Comprehensive Performance Optimization and Page Loader System:
  * Implemented lazy loading for all page components using React.lazy() and Suspense
  * Added comprehensive PageLoader component with multiple variants (default, minimal, card)
  * Created LazyWrapper component for consistent loading states across all pages
  * Optimized React Query configuration with intelligent retry logic and caching
  * Added performance monitoring hooks (usePerformanceMonitor, useNetworkMonitor)
  * Implemented in-memory API cache with TTL and automatic cleanup
  * Created VirtualList component for efficient rendering of large datasets
  * Added debounce hooks for optimizing user input handling
  * Built comprehensive performance dashboard with real-time metrics
  * Implemented memoized components for frequently rendered elements
  * Added optimized image loading with intersection observer
  * Enhanced query client with exponential backoff and error handling
  * Created performance-aware component architecture for better UX
- July 03, 2025. Enhanced Categories Page with Rich List Design and Icon Support:
  * Completely redesigned categories page from cards to a sophisticated list layout
  * Added comprehensive statistics overview with visual counters for each category type
  * Separated categories into logical sections: Income, Fixed Expenses, and Variable Expenses
  * Implemented custom icon selection system with 24+ available icons for categories
  * Added visual icon picker in category form with grid layout and hover effects
  * Enhanced category display with larger icons, better typography, and improved spacing
  * Added icon field to database schema with proper migration support
  * Categories now display with custom icons and colors in an elegant list format
  * Mobile-responsive design with optimized layouts for all screen sizes
- July 03, 2025. Production-Ready Codebase Quality Improvements:
  * Separated bank accounts from credit cards as distinct entities in account management
  * Excluded credit card limits from total balance calculations for accurate financial reporting
  * Optimized large dataset handling with cursor-based pagination for 1000+ transactions
  * Enhanced type safety by replacing 'any' types with comprehensive TypeScript interfaces
  * Implemented React Error Boundaries for robust error handling across the application
  * Added LazyImage component with intersection observer for future image optimization
  * Created AdvancedDataTable component with virtualization, search, sort, and export features
  * Fixed all critical TypeScript errors and improved overall code quality
  * Enhanced security measures and validated production readiness
- July 04, 2025. Notification Persistence System Implementation:
  * Fixed critical notification read state persistence issue where states reset on page refresh
  * Added userNotificationStates database table with full schema and relations
  * Implemented comprehensive notification state API endpoints for read/dismiss actions
  * Enhanced useNotifications hook with database integration and optimistic updates
  * Added proper error handling and rollback mechanisms for notification state changes
  * Notifications now maintain read/dismissed states permanently across sessions
  * Improved user experience with seamless notification management
- July 05, 2025. Fixed Auto-Focus and Auto-Selection Issues:
  * Disabled automatic focus behavior in dialog components (DialogContent onOpenAutoFocus)
  * Prevented auto-selection of input text when forms open or inputs are focused
  * Updated Input, CurrencyInput, and Textarea components with focus handlers
  * Forms now open without immediately prompting user to type or selecting existing text
  * Improved user experience by allowing forms to remain static until user initiates interaction
- July 05, 2025. Enhanced Brazilian Currency Formatting System:
  * Completely rewrote currency formatting logic for proper Brazilian Real display
  * Implemented real-time thousands separators during typing (47.550,01 format)
  * Added cents-based input approach for accurate decimal handling
  * Updated formatCurrencyInput to use Intl.NumberFormat with pt-BR locale
  * Enhanced parseCurrencyToNumber to handle thousands separators correctly
  * Updated CurrencyInput component with proper formatting on blur and focus
  * All currency inputs now maintain consistent Brazilian formatting throughout the system
- July 05, 2025. Enhanced Filter Organization and Dialog Accessibility:
  * Fixed accessibility warnings by adding DialogDescription to all dialog components
  * Completely reorganized filter system to separate accounts and cards into distinct blocks
  * Bank accounts and credit cards now display in separate sections with color-coded borders
  * Categories are now organized by type: Receitas, Gastos Fixos, and Gastos Variáveis
  * Added proper visual hierarchy with section headers and border indicators
  * Fixed budget page filtering functionality with status options (over budget, near limit, on track)
  * Enhanced filter configuration to support budget-specific status filtering
- July 05, 2025. Fixed Transaction Filtering Logic for Accurate Financial Calculations:
  * Separated filtered display totals from overall financial position calculations
  * Liquid amount (Saldo Líquido) now always shows real financial position regardless of filters
  * Filtered totals for income and expenses update correctly when using filters
  * Fixed issue where expense filters incorrectly affected liquid amount calculations
  * Enhanced type safety with proper array type guards throughout transaction components
- July 05, 2025. Implemented Simple Persistent Liquid Amount Logic:
  * Liquid Amount = Total Income (all transactions) - Total Expenses (all transactions)
  * Only affected by date filters, never by category, account, or type filters
  * Provides consistent financial position regardless of active filter selections
  * Simple mathematical calculation: sum of all incomes minus sum of all expenses
- July 05, 2025. Fixed Liquid Amount Calculation with Dedicated API Endpoint:
  * Created `/api/transactions/liquid-amount` endpoint for accurate calculation using all historical transactions
  * Separated display logic: filtered totals for table view vs. true financial position for liquid amount
  * Updated card labels: "Receitas (Filtradas)", "Despesas (Filtradas)", "Saldo Líquido (Total)", "Transações (Visíveis)"
  * Fixed discrepancy between table display (recent transactions) and liquid calculation (all transactions)
  * Liquid amount now accurately reflects user's complete financial position: R$ 5.251,85
- July 05, 2025. Implemented Default Current Month Filtering Across Entire Application:
  * Created global default filter utility with current month date range
  * Applied current month filtering by default to all major pages: Dashboard, Transactions, Budgets, Accounts, Invoices
  * Updated liquid amount calculation to respect date filters when provided
  * All financial data now displays current month by default for consistent user experience
  * Users can still change date ranges but system defaults to current month context
- July 05, 2025. Created Modern Form Design System for Enhanced Mobile and Desktop Experience:
  * Built comprehensive modern form component architecture with ModernForm, ModernField, and IconGrid
  * Enhanced form styling with fluid design, rounded corners, improved focus states, and subtle animations
  * Implemented responsive icon grid layout for categories: 4 columns mobile, 6 tablet, 8+ desktop
  * Created ModernInput and enhanced CurrencyInput with improved focus indicators and error states
  * Developed ModernTransactionForm showcasing responsive grids, advanced toggles, and mobile-optimized layouts
  * Forms now feature gradient buttons, better spacing, improved typography, and seamless responsive behavior
  * Updated form styling to be more modern, accessible, and visually appealing across all screen sizes
- July 05, 2025. Complete Authentication System Overhaul with User Management:
  * Enhanced users table schema with email, userType (admin/user), securityPhrase, isActive, lastLoginAt fields
  * Implemented comprehensive user management with proper role-based access control
  * Created complete login, register, and password reset system with proper validation
  * Added email-based authentication and security phrase recovery system
  * Built tabbed login interface with modern UI: Login, Register, and Password Recovery tabs
  * Session management with proper last login tracking and user activity monitoring
  * Fixed onboarding redirect issue - users now properly navigate to dashboard after completion
  * Admin user (admin/123) has full access, regular users go through onboarding flow
  * Complete user registration system with email uniqueness validation and security phrases
- July 05, 2025. Comprehensive Mobile Responsiveness Improvements:
  * Fixed filter forms scroll and height limitations preventing mobile users from accessing all content
  * Updated AdvancedFilter PopoverContent: responsive width (max-w-sm sm:max-w-md md:max-w-lg) instead of fixed w-96
  * Enhanced individual filter sections: increased heights from max-h-24 to max-h-32 sm:max-h-40 for better scrolling
  * Fixed dashboard filter components: single column on mobile (grid-cols-1 sm:grid-cols-2) and increased heights
  * Updated topbar notifications popup: responsive width (max-w-sm sm:max-w-md) instead of fixed w-80
  * All filter forms now properly accessible on mobile with improved scrolling and content visibility
  * Existing mobile-safe CSS classes and responsive grid layouts confirmed working across all pages
  * Table components use table-responsive class for proper horizontal scrolling on mobile devices
- July 06, 2025. Comprehensive System Enhancement: Placeholder Elimination, Form Fixes, and Advanced Features:
  * PLACEHOLDER ELIMINATION: Replaced all hardcoded/mock functions throughout entire system with real data calculations
  * Dashboard KPIs now use genuine financial data instead of placeholders (income trends, budget percentages, goal tracking)
  * Invoice analysis performs real transaction variation calculations vs. mock hardcoded percentages
  * Investment trends only show when actual growth data exists, properly handle zero-data states
  * AI predictor performs authentic statistical analysis on transaction patterns instead of mock predictions
  * ACCOUNT FORM FIXES: Removed "Account Name" field, auto-generate names based on bank + type selection
  * Moved bank selector to top of account form for better UX flow
  * Fixed validation error: balance field expects string format, corrected schema validation
  * CARD LOGO SYSTEM: Created separate card brand logo system (Visa, Mastercard, Elo, American Express, etc.)
  * Implemented CardLogo component and CardSelector with Brazilian credit card brand support
  * Separate from bank logos to distinguish between bank institutions and card payment networks
  * MOBILE FILTER SYSTEM: Created MobileFilterOverlay with full-screen sheet interface for mobile devices
  * Desktop retains scrollable forms, mobile uses overlay popup for better UX
  * Filter tags/chips always visible showing active filters with individual clear buttons
  * Enhanced filter organization: bank accounts vs credit cards, income vs expense categories
  * DEFAULT FILTER BEHAVIOR: Only current month period applied by default, no other filters active initially
  * Users can apply additional filters but system starts with clean current month view
  * CONFIGURATION WIZARD: Built comprehensive step-by-step setup system for regular users
  * 5-step process: Profile, Financial Settings, Goals, Security, Automation
  * Customizable parameters: income, savings percentage, credit limits, alert thresholds
  * Visual progress tracking with slider controls and intelligent form validation
  * All systems now use real data calculations with proper zero-state handling throughout
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Language: Portuguese Brazilian (pt-BR) - All UI text, messages, and user-facing content should be in Portuguese.
Development approach: Focus on realistic data generation and comprehensive testing features.
```