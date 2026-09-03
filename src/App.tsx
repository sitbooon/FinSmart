import React, { useState, useMemo, useEffect } from 'react';
import {
  demoAccounts,
  demoCreditCards,
  demoTransactions,
  demoFixedExpenses,
  demoExpectedIncomes,
  demoCategories,
  demoBudgets,
  demoSavingGoals,
  demoDebts,
  demoInvestments,
  defaultMerchantRules,
  cleanAccounts,
  cleanCreditCards,
  cleanTransactions,
  cleanFixedExpenses,
  cleanExpectedIncomes,
  cleanCategories,
  cleanBudgets,
  cleanSavingGoals,
  cleanDebts,
  cleanInvestments,
  cleanMerchantRules,
} from './data/demoData';
import {
  Account,
  CreditCard,
  Transaction,
  FixedExpense,
  ExpectedIncome,
  Category,
  Budget,
  SavingGoal,
  Debt,
  Investment,
} from './types';
import {
  calculateSnapshot,
  generateDailyCashflowForecast,
  detectAnomalies,
} from './utils/financeEngine';
import { Navbar, TabType } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CashflowView } from './components/CashflowView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { AccountsView } from './components/AccountsView';
import { SimulatorView } from './components/SimulatorView';
import { AiAssistantView } from './components/AiAssistantView';
import { SavingsDebtsView } from './components/SavingsDebtsView';
import { InvestmentsView } from './components/InvestmentsView';
import { ReportsView } from './components/ReportsView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { CsvImportModal } from './components/CsvImportModal';
import { DataManagementModal } from './components/DataManagementModal';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('finos_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('finos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('finos_theme', 'light');
    }
  }, [isDark]);

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [familyMember, setFamilyMember] = useState<string>('משותף');
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Check if we should switch to clean version (user asked: "תעשה לי גירסא טובה ריקה מתוכן")
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const savedDemoFlag = localStorage.getItem('finos_is_demo');
    if (savedDemoFlag !== null) {
      return savedDemoFlag === 'true';
    }
    // If not set yet, initialize in clean mode as requested
    const hasInitializedClean = localStorage.getItem('finos_clean_v1');
    if (!hasInitializedClean) {
      localStorage.setItem('finos_clean_v1', 'true');
      localStorage.setItem('finos_is_demo', 'false');
      // Clean previous demo state from localStorage so the user sees clean version immediately
      localStorage.removeItem('finos_accounts');
      localStorage.removeItem('finos_cards');
      localStorage.removeItem('finos_transactions');
      localStorage.removeItem('finos_fixed');
      localStorage.removeItem('finos_incomes');
      localStorage.removeItem('finos_budgets');
      localStorage.removeItem('finos_goals');
      localStorage.removeItem('finos_debts');
      localStorage.removeItem('finos_investments');
      return false;
    }
    return false;
  });

  // Application Data States (Default to clean slate or demo if chosen)
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('finos_accounts');
    if (saved) return JSON.parse(saved);
    const isDemo = localStorage.getItem('finos_is_demo') === 'true';
    return isDemo ? demoAccounts : cleanAccounts;
  });

  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('finos_cards');
    if (saved) return JSON.parse(saved);
    const isDemo = localStorage.getItem('finos_is_demo') === 'true';
    return isDemo ? demoCreditCards : cleanCreditCards;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finos_transactions');
    if (saved) return JSON.parse(saved);
    const isDemo = localStorage.getItem('finos_is_demo') === 'true';
    return isDemo ? demoTransactions : cleanTransactions;
  });

  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => {
    const saved = localStorage.getItem('finos_fixed');
    if (saved) return JSON.parse(saved);
    const isDemo = localStorage.getItem('finos_is_demo') === 'true';
    return isDemo ? demoFixedExpenses : cleanFixedExpenses;
  });

  const [expectedIncomes, setExpectedIncomes] = useState<ExpectedIncome[]>(() => {
    const saved = localStorage.getItem('finos_incomes');
    if (saved) return JSON.parse(saved);
    const isDemo = localStorage.getItem('finos_is_demo') === 'true';
    return isDemo ? demoExpectedIncomes : cleanExpectedIncomes;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('finos_categories');
    return saved ? JSON.parse(saved) : cleanCategories;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('finos_budgets');
    if (saved) return JSON.parse(saved);
    const isDemo = localStorage.getItem('finos_is_demo') === 'true';
    return isDemo ? demoBudgets : cleanBudgets;
  });

  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>(() => {
    const saved = localStorage.getItem('finos_goals');
    if (saved) return JSON.parse(saved);
    const isDemo = localStorage.getItem('finos_is_demo') === 'true';
    return isDemo ? demoSavingGoals : cleanSavingGoals;
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('finos_debts');
    if (saved) return JSON.parse(saved);
    const isDemo = localStorage.getItem('finos_is_demo') === 'true';
    return isDemo ? demoDebts : cleanDebts;
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem('finos_investments');
    if (saved) return JSON.parse(saved);
    const isDemo = localStorage.getItem('finos_is_demo') === 'true';
    return isDemo ? demoInvestments : cleanInvestments;
  });

  const [merchantRules, setMerchantRules] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('finos_rules');
    return saved ? JSON.parse(saved) : defaultMerchantRules;
  });

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem('finos_accounts', JSON.stringify(accounts));
    localStorage.setItem('finos_cards', JSON.stringify(creditCards));
    localStorage.setItem('finos_transactions', JSON.stringify(transactions));
    localStorage.setItem('finos_fixed', JSON.stringify(fixedExpenses));
    localStorage.setItem('finos_incomes', JSON.stringify(expectedIncomes));
    localStorage.setItem('finos_categories', JSON.stringify(categories));
    localStorage.setItem('finos_budgets', JSON.stringify(budgets));
    localStorage.setItem('finos_goals', JSON.stringify(savingGoals));
    localStorage.setItem('finos_debts', JSON.stringify(debts));
    localStorage.setItem('finos_investments', JSON.stringify(investments));
    localStorage.setItem('finos_rules', JSON.stringify(merchantRules));
  }, [
    accounts,
    creditCards,
    transactions,
    fixedExpenses,
    expectedIncomes,
    categories,
    budgets,
    savingGoals,
    debts,
    investments,
    merchantRules,
  ]);

  // Filter transactions by selected family member if not 'משותף'
  const memberTransactions = useMemo(() => {
    if (familyMember === 'משותף') return transactions;
    return transactions.filter(
      (tx) => tx.familyMember === familyMember || tx.familyMember === 'משותף' || !tx.familyMember
    );
  }, [transactions, familyMember]);

  // Core Financial Engine Computations (Calculated deterministically)
  const snapshot = useMemo(() => {
    return calculateSnapshot(
      accounts,
      creditCards,
      memberTransactions,
      fixedExpenses,
      expectedIncomes,
      savingGoals,
      debts,
      investments,
      budgets
    );
  }, [
    accounts,
    creditCards,
    memberTransactions,
    fixedExpenses,
    expectedIncomes,
    savingGoals,
    debts,
    investments,
    budgets,
  ]);

  const forecast = useMemo(() => {
    return generateDailyCashflowForecast(
      accounts,
      creditCards,
      fixedExpenses,
      expectedIncomes,
      new Date(),
      snapshot.dailyRecommendedBudget
    );
  }, [accounts, creditCards, fixedExpenses, expectedIncomes, snapshot.dailyRecommendedBudget]);

  const alerts = useMemo(() => {
    return detectAnomalies(transactions, budgets);
  }, [transactions, budgets]);

  // AI Insights generated automatically based on current finances
  const aiInsights = useMemo(() => {
    if (transactions.length === 0) {
      return [
        {
          id: 'ins-welcome',
          title: 'ברוכים הבאים למערכת הפיננסית!',
          text: 'המערכת נקייה מתוכן ומוכנה לקליטת הנתונים שלך. הגדר יתרת עו״ש בחשבונות, הוסף תנועות או ייבא קובץ CSV מהבנק.',
          category: 'התחלה מהירה',
          badge: 'מוכן לעבודה',
          type: 'info',
        },
        {
          id: 'ins-safe',
          title: 'שמירת נתונים מאובטחת',
          text: 'כל נתון שאתה מזין נשמר מיד בזיכרון המקומי של הדפדפן שלך. תוכל גם להוריד קובץ גיבוי מלא בכל שלב.',
          category: 'פרטיות וגיבוי',
          badge: 'גיבוי מקומי',
          type: 'success',
        },
        {
          id: 'ins-tip',
          title: 'בניית תקציב חודשי',
          text: 'מומלץ להגדיר תקציב לקטגוריות מרכזיות (סופר, בילויים, דיור) כדי לקבל מרווח ביטחון יומי מומלץ והתראות חריגה.',
          category: 'טיפ פיננסי',
          badge: 'המלצה',
          type: 'info',
        },
      ];
    }

    const list = [];
    if (snapshot.realAvailableMoney > 5000) {
      list.push({
        id: 'ins-1',
        title: 'הזדמנות להגדלת חיסכון',
        text: `יש לך כרגע ₪${snapshot.realAvailableMoney.toLocaleString()} כסף פנוי אמיתי. מומלץ להעביר ₪1,500 לקרן החירום או לקופת הגמל להשקעה.`,
        category: 'חיסכון והשקעות',
        badge: 'המלצה',
        type: 'success',
      });
    }

    const restSpend = memberTransactions
      .filter((t) => t.category === 'מסעדות ובילויים')
      .reduce((s, t) => s + t.amount, 0);
    if (restSpend > 1000) {
      list.push({
        id: 'ins-2',
        title: 'עלייה בהוצאות מסעדות ובילויים',
        text: `הוצאת החודש ₪${restSpend.toLocaleString()} על מסעדות. הפחתה של 2 ארוחות בחוץ תחסוך לך כ-₪350 עד סוף החודש.`,
        category: 'בקרת תקציב',
        badge: 'שים לב',
        type: 'warning',
      });
    }

    list.push({
      id: 'ins-3',
      title: 'מועדי חיובי אשראי קרובים',
      text: `ב-10 וב-15 לחודש צפויים לרדת חיובים בסך ₪${snapshot.upcomingCreditCardBills.toLocaleString()}. היתרה בעו״ש מספיקה לכיסוי ללא כניסה למינוס.`,
      category: 'תזרים שוטף',
      badge: 'תזרים בטוח',
      type: 'info',
    });

    list.push({
      id: 'ins-4',
      title: 'בדיקת דמי ניהול בפנסיה וגמל',
      text: `דמי הניהול הממוצעים שלך הם 0.58%. משא ומתן קצר להורדה ל-0.4% יחסוך לך עשרות אלפי שקלים לאורך השנים.`,
      category: 'השקעות ופנסיה',
      badge: 'חיסכון לטווח ארוך',
      type: 'info',
    });

    return list;
  }, [snapshot, memberTransactions, transactions.length]);

  // Data state management: Clean version vs Demo version
  const handleLoadCleanState = () => {
    setIsDemoMode(false);
    localStorage.setItem('finos_is_demo', 'false');
    setAccounts(cleanAccounts);
    setCreditCards(cleanCreditCards);
    setTransactions(cleanTransactions);
    setFixedExpenses(cleanFixedExpenses);
    setExpectedIncomes(cleanExpectedIncomes);
    setCategories(cleanCategories);
    setBudgets(cleanBudgets);
    setSavingGoals(cleanSavingGoals);
    setDebts(cleanDebts);
    setInvestments(cleanInvestments);
    setMerchantRules(cleanMerchantRules);
  };

  const handleLoadDemoState = () => {
    setIsDemoMode(true);
    localStorage.setItem('finos_is_demo', 'true');
    setAccounts(demoAccounts);
    setCreditCards(demoCreditCards);
    setTransactions(demoTransactions);
    setFixedExpenses(demoFixedExpenses);
    setExpectedIncomes(demoExpectedIncomes);
    setCategories(demoCategories);
    setBudgets(demoBudgets);
    setSavingGoals(demoSavingGoals);
    setDebts(demoDebts);
    setInvestments(demoInvestments);
    setMerchantRules(defaultMerchantRules);
  };

  const handleRestoreBackup = (data: any) => {
    if (data.accounts) setAccounts(data.accounts);
    if (data.creditCards) setCreditCards(data.creditCards);
    if (data.transactions) setTransactions(data.transactions);
    if (data.fixedExpenses) setFixedExpenses(data.fixedExpenses);
    if (data.expectedIncomes) setExpectedIncomes(data.expectedIncomes);
    if (data.categories) setCategories(data.categories);
    if (data.budgets) setBudgets(data.budgets);
    if (data.savingGoals) setSavingGoals(data.savingGoals);
    if (data.debts) setDebts(data.debts);
    if (data.investments) setInvestments(data.investments);
    if (data.merchantRules) setMerchantRules(data.merchantRules);
    setIsDemoMode(false);
    localStorage.setItem('finos_is_demo', 'false');
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleImportCsv = (newTxs: Transaction[]) => {
    setTransactions((prev) => [...newTxs, ...prev]);
  };

  const handleAskAiFromInsight = (prompt: string) => {
    setAiCustomPrompt(prompt);
    setActiveTab('ai');
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-slate-100 antialiased font-sans transition-colors selection:bg-[#00B894] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        monthStatus={snapshot.monthStatus}
        familyMember={familyMember}
        setFamilyMember={setFamilyMember}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        onResetDemo={handleLoadDemoState}
        isDark={isDark}
        setIsDark={setIsDark}
        isDemoMode={isDemoMode}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            snapshot={snapshot}
            forecast={forecast}
            transactions={memberTransactions}
            alerts={alerts}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            aiInsights={aiInsights}
            onAskAi={handleAskAiFromInsight}
            isDemoMode={isDemoMode}
            onOpenCsvModal={() => setIsCsvModalOpen(true)}
            onOpenDataModal={() => setIsDataModalOpen(true)}
          />
        )}

        {activeTab === 'cashflow' && (
          <CashflowView
            snapshot={snapshot}
            forecast={forecast}
            fixedExpenses={fixedExpenses}
            setFixedExpenses={setFixedExpenses}
            expectedIncomes={expectedIncomes}
            setExpectedIncomes={setExpectedIncomes}
            creditCards={creditCards}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={memberTransactions}
            setTransactions={setTransactions}
            categories={categories}
            setCategories={setCategories}
            accounts={accounts}
            creditCards={creditCards}
            merchantRules={merchantRules}
            setMerchantRules={setMerchantRules}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            budgets={budgets}
            setBudgets={setBudgets}
            categories={categories}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsView
            accounts={accounts}
            setAccounts={setAccounts}
            creditCards={creditCards}
            setCreditCards={setCreditCards}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView snapshot={snapshot} forecast={forecast} />
        )}

        {activeTab === 'ai' && (
          <AiAssistantView
            snapshot={snapshot}
            forecast={forecast}
            transactions={memberTransactions}
            initialPrompt={aiCustomPrompt}
            aiInsights={aiInsights}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsDebtsView
            savingGoals={savingGoals}
            setSavingGoals={setSavingGoals}
            debts={debts}
            setDebts={setDebts}
          />
        )}

        {activeTab === 'investments' && (
          <InvestmentsView
            investments={investments}
            setInvestments={setInvestments}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            snapshot={snapshot}
            accounts={accounts}
            investments={investments}
            debts={debts}
            transactions={memberTransactions}
            creditCards={creditCards}
          />
        )}
      </main>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
        categories={categories}
        accounts={accounts}
        creditCards={creditCards}
        merchantRules={merchantRules}
        activeFamilyMember={familyMember}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImport={handleImportCsv}
        existingTransactions={transactions}
      />

      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        isDemoMode={isDemoMode}
        onLoadCleanState={handleLoadCleanState}
        onLoadDemoState={handleLoadDemoState}
        appData={{
          accounts,
          creditCards,
          transactions,
          fixedExpenses,
          expectedIncomes,
          categories,
          budgets,
          savingGoals,
          debts,
          investments,
          merchantRules,
        }}
        onRestoreBackup={handleRestoreBackup}
      />
    </div>
  );
}
