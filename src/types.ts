export type AccountType = 'checking' | 'savings' | 'investment' | 'cash' | 'other';
export type TransactionType = 'income' | 'expense';
export type IncomeKind = 'salary' | 'business' | 'recurring' | 'one_time';
export type DebtType = 'mortgage' | 'loan' | 'credit' | 'car_loan' | 'bank_loan' | 'other';
export type InvestmentType = 'stocks' | 'funds' | 'pension' | 'study_fund' | 'crypto' | 'real_estate' | 'provident_fund';
export type MonthHealthStatus = 'good' | 'warning' | 'danger';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  bankName: string;
  lastUpdated: string;
  notes?: string;
  isFamilyShared?: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  company: string;
  lastFourDigits: string;
  limit: number;
  billingDay: number; // e.g. 10 or 15
  currentBillingTotal: number;
  remainingInstallmentsTotal: number;
  linkedAccountId: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  subCategory?: string;
  accountId: string;
  creditCardId?: string;
  isRecurring?: boolean;
  isFixed?: boolean;
  isBusiness?: boolean;
  notes?: string;
  installments?: {
    current: number;
    total: number;
    monthlyAmount?: number;
  };
  familyMember?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  isCustom?: boolean;
}

export interface Budget {
  categoryId: string;
  categoryName: string;
  monthlyLimit: number;
  spentSoFar: number;
  projectedSpend: number;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  category: string;
  accountId?: string;
  isPaidThisMonth: boolean;
}

export interface ExpectedIncome {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  kind: IncomeKind;
  isReceivedThisMonth: boolean;
  recipient?: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyTargetDeposit?: number;
  monthlyDeposit?: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  color?: string;
}

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  totalRemaining?: number;
  currentBalance?: number;
  originalAmount?: number;
  interestRate: number; // percentage, e.g. 3.5
  monthlyPayment: number;
  remainingPayments?: number;
  endDate: string;
  lender?: string;
}

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  currentValue: number;
  annualReturnRate?: number; // percentage, e.g. 8.4
  annualReturnPct?: number;
  managementFeePct?: number;
  institution?: string;
  provider?: string;
  monthlyDeposit?: number;
  notes?: string;
}

export interface AnomalyAlert {
  id: string;
  type: 'spike' | 'new_merchant' | 'new_subscription' | 'duplicate_charge' | 'budget_warning' | 'savings_opportunity';
  title: string;
  message: string;
  amount?: number;
  date: string;
  severity: 'info' | 'warning' | 'danger';
  isResolved?: boolean;
}

export interface DayForecast {
  day: number;
  dateStr: string;
  projectedBalance: number;
  netDayChange: number;
  events: Array<{ name: string; amount: number; type: 'income' | 'expense' }>;
}

export interface FinancialSnapshot {
  currentCheckingBalance: number;
  realAvailableMoney: number;
  projectedEndOfMonthBalance: number;
  dailyRecommendedBudget: number;
  monthIncomeActual: number;
  monthExpenseActual: number;
  pendingIncomesThisMonth: number;
  pendingFixedExpenses: number;
  upcomingCreditCardBills: number;
  monthStatus: MonthHealthStatus;
  statusExplanation: string;
  financialScore: number;
  scoreBreakdown: {
    cashflowScore: number;
    savingsScore: number;
    budgetControlScore: number;
    debtHealthScore: number;
  };
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
  topExpenseCategories: Array<{ category: string; amount: number; percentage: number }>;
}

export interface WhatIfScenario {
  id: string;
  title: string;
  type: 'one_time_expense' | 'recurring_expense' | 'income_boost' | 'new_loan' | 'cancel_subscription' | 'increase_savings';
  amount: number;
  notes?: string;
  installments?: number;
}

export interface SimulationScenario {
  type: 'expense' | 'income' | 'cancel_expense';
  amount: number;
  installments?: number;
  dayOfMonth?: number;
  description: string;
}
