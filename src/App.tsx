import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  DeletedTransaction,
} from './types';
import {
  calculateSnapshot,
  generateDailyCashflowForecast,
  detectAnomalies,
  calculateMonthlySummaries,
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
import { QuickBalanceModal } from './components/QuickBalanceModal';
import { AvailableMoneyExplainerModal } from './components/AvailableMoneyExplainerModal';
import { DeletedTransactionsModal } from './components/DeletedTransactionsModal';
import { UndoToast } from './components/UndoToast';
import { HouseholdSyncModal } from './components/HouseholdSyncModal';
import { ExcelDatabaseModal } from './components/ExcelDatabaseModal';
import { ExcelDatabaseData } from './utils/excelDatabaseEngine';
import { auth } from './firebase/config';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  Household,
  SharedLedgerPayload,
  getUserProfile,
  getHousehold,
  findHouseholdForEmail,
  createHousehold,
  joinHouseholdByCode,
  inviteSpouseByEmail,
  subscribeToHouseholdLedger,
  saveHouseholdLedger,
  setUserActiveHousehold,
} from './firebase/householdService';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('finos_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('finos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('finos_theme', 'light');
    }
  }, [isDark]);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');

  // Month selection state (User requested monthly navigation)
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return localStorage.getItem('finos_selected_month') || currentMonthKey;
  });

  useEffect(() => {
    localStorage.setItem('finos_selected_month', selectedMonth);
  }, [selectedMonth]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isExcelDbModalOpen, setIsExcelDbModalOpen] = useState(false);
  const [isQuickBalanceOpen, setIsQuickBalanceOpen] = useState(false);
  const [isAvailableExplainerOpen, setIsAvailableExplainerOpen] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);

  // Household Cloud Sync state (cross-device sync & couple sharing)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [prefilledInviteCode, setPrefilledInviteCode] = useState('');
  const isRemoteUpdateRef = useRef(false);

  // Deleted transactions history & Undo Toast state (Safe delete / Undo)
  const [deletedTransactions, setDeletedTransactions] = useState<DeletedTransaction[]>(() => {
    const saved = localStorage.getItem('finos_deleted_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeUndoTx, setActiveUndoTx] = useState<Transaction | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Check if we should switch to clean version (user asked: "תעשה לי מערכת נקייה נקייה מכל רבב")
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const savedDemoFlag = localStorage.getItem('finos_is_demo');
    if (savedDemoFlag !== null) {
      return savedDemoFlag === 'true';
    }
    // Clean mode initialized by default
    const hasInitializedClean = localStorage.getItem('finos_clean_v2');
    if (!hasInitializedClean) {
      localStorage.setItem('finos_clean_v2', 'true');
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
    localStorage.setItem('finos_deleted_transactions', JSON.stringify(deletedTransactions));
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
    deletedTransactions,
  ]);

  // 1. Detect join code from URL params (e.g. spouse opened link ?join=FAM-1234)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setPrefilledInviteCode(joinCode.toUpperCase());
      setIsSyncModalOpen(true);
    }
  }, []);

  // 2. Firebase Auth Listener - track logged-in user and active household
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setCurrentHousehold(null);
        return;
      }

      try {
        // Look up active household for user
        const profile = await getUserProfile(user.uid);
        let householdId = profile?.activeHouseholdId;

        // If user doesn't have an active household, check if spouse pre-invited their email
        if (!householdId && user.email) {
          const invitedHousehold = await findHouseholdForEmail(user.email);
          if (invitedHousehold) {
            householdId = invitedHousehold.id;
            await setUserActiveHousehold(user.uid, householdId);
          }
        }

        if (householdId) {
          const hh = await getHousehold(householdId);
          if (hh) {
            setCurrentHousehold(hh);
          }
        }
      } catch (err) {
        console.error('Error fetching user household:', err);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Real-time Subscription to Shared Household Ledger in Firestore
  useEffect(() => {
    if (!currentHousehold) return;

    setIsSyncing(true);
    const unsubscribe = subscribeToHouseholdLedger(currentHousehold.id, (cloudLedger) => {
      isRemoteUpdateRef.current = true;
      if (cloudLedger.accounts) setAccounts(cloudLedger.accounts);
      if (cloudLedger.creditCards) setCreditCards(cloudLedger.creditCards);
      if (cloudLedger.transactions) setTransactions(cloudLedger.transactions);
      if (cloudLedger.fixedExpenses) setFixedExpenses(cloudLedger.fixedExpenses);
      if (cloudLedger.expectedIncomes) setExpectedIncomes(cloudLedger.expectedIncomes);
      if (cloudLedger.categories) setCategories(cloudLedger.categories);
      if (cloudLedger.budgets) setBudgets(cloudLedger.budgets);
      if (cloudLedger.savingGoals) setSavingGoals(cloudLedger.savingGoals);
      if (cloudLedger.debts) setDebts(cloudLedger.debts);
      if (cloudLedger.investments) setInvestments(cloudLedger.investments);
      if (cloudLedger.merchantRules) setMerchantRules(cloudLedger.merchantRules);
      if (cloudLedger.deletedTransactions) setDeletedTransactions(cloudLedger.deletedTransactions);

      setLastSyncedAt(new Date());
      setIsSyncing(false);

      // Release the remote update lock
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 600);
    });

    return () => unsubscribe();
  }, [currentHousehold?.id]);

  // 4. Auto-save local modifications to Firestore (Debounced, skipping remote snapshots)
  useEffect(() => {
    if (!currentHousehold || !currentUser || isRemoteUpdateRef.current) return;

    const timer = setTimeout(async () => {
      try {
        setIsSyncing(true);
        await saveHouseholdLedger(
          currentHousehold.id,
          {
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
            deletedTransactions,
          },
          currentUser.uid,
          currentUser.email || undefined
        );
        setLastSyncedAt(new Date());
      } catch (err) {
        console.error('Error auto-syncing ledger to cloud:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    currentHousehold?.id,
    currentUser?.uid,
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
    deletedTransactions,
  ]);

  // Household Management Actions
  const handleCreateHousehold = async (name: string) => {
    if (!currentUser) throw new Error('יש להתחבר תחילה כדי ליצור מרחב משותף');
    const newHh = await createHousehold(name, currentUser.uid, currentUser.email || undefined);

    // Immediately push current local data to seed the new cloud household
    await saveHouseholdLedger(
      newHh.id,
      {
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
        deletedTransactions,
      },
      currentUser.uid,
      currentUser.email || undefined
    );

    setCurrentHousehold(newHh);
    setLastSyncedAt(new Date());
    setToastNotification(`המרחב "${name}" נוצר וסונכרן לענן בהצלחה!`);
  };

  const handleJoinHousehold = async (code: string) => {
    if (!currentUser) throw new Error('יש להתחבר תחילה כדי להצטרף למרחב משותף');
    const hh = await joinHouseholdByCode(code, currentUser.uid, currentUser.email || undefined);
    setCurrentHousehold(hh);
    setToastNotification(`הצטרפת בהצלחה למרחב "${hh.name}"! הנתונים נטענו.`);
  };

  const handleInviteSpouse = async (email: string) => {
    if (!currentHousehold) return;
    await inviteSpouseByEmail(currentHousehold.id, email);
    // Reload household to refresh members list
    const updated = await getHousehold(currentHousehold.id);
    if (updated) {
      setCurrentHousehold(updated);
    }
  };

  const handleManualSync = async () => {
    if (!currentHousehold || !currentUser) return;
    setIsSyncing(true);
    try {
      await saveHouseholdLedger(
        currentHousehold.id,
        {
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
          deletedTransactions,
        },
        currentUser.uid,
        currentUser.email || undefined
      );
      setLastSyncedAt(new Date());
      setToastNotification('הנתונים סונכרנו לענן בהצלחה');
    } catch (err: any) {
      console.error('Manual sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Monthly summaries calculation for month comparison strip
  const monthlySummaries = useMemo(() => {
    return calculateMonthlySummaries(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  // Core Financial Engine Computations (Calculated deterministically)
  const snapshot = useMemo(() => {
    return calculateSnapshot(
      accounts,
      creditCards,
      transactions,
      fixedExpenses,
      expectedIncomes,
      savingGoals,
      debts,
      investments,
      budgets,
      selectedMonth
    );
  }, [
    accounts,
    creditCards,
    transactions,
    fixedExpenses,
    expectedIncomes,
    savingGoals,
    debts,
    investments,
    budgets,
    selectedMonth,
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

    const restSpend = transactions
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
  }, [snapshot, transactions]);

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
    setDeletedTransactions([]);
    localStorage.removeItem('finos_deleted_transactions');
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
    if (data.deletedTransactions) setDeletedTransactions(data.deletedTransactions);
    setIsDemoMode(false);
    localStorage.setItem('finos_is_demo', 'false');
  };

  const handleRestoreExcelDatabase = (newData: ExcelDatabaseData) => {
    if (newData.accounts && newData.accounts.length > 0) setAccounts(newData.accounts);
    if (newData.creditCards && newData.creditCards.length > 0) setCreditCards(newData.creditCards);
    if (newData.transactions) setTransactions(newData.transactions);
    if (newData.budgets && newData.budgets.length > 0) setBudgets(newData.budgets);
    if (newData.fixedExpenses) setFixedExpenses(newData.fixedExpenses);
    if (newData.expectedIncomes) setExpectedIncomes(newData.expectedIncomes);
    if (newData.savingGoals) setSavingGoals(newData.savingGoals);
    if (newData.debts) setDebts(newData.debts);
    if (newData.investments) setInvestments(newData.investments);
    setIsDemoMode(false);
    localStorage.setItem('finos_is_demo', 'false');
    setToastNotification(`מסד הנתונים מאקסל נטען וסונכרן בהצלחה! (${newData.transactions?.length || 0} תנועות)`);
  };

  // Transactions deletion & restore logic
  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    const newDeleted: DeletedTransaction = {
      transaction: tx,
      deletedAt: new Date().toISOString(),
    };
    setDeletedTransactions((prev) => [newDeleted, ...prev]);
    setActiveUndoTx(tx);
    setToastNotification(null);
  };

  const handleRestoreTransaction = (txToRestore: Transaction) => {
    setTransactions((prev) => {
      if (prev.some((t) => t.id === txToRestore.id)) return prev;
      return [txToRestore, ...prev];
    });
    setDeletedTransactions((prev) => prev.filter((d) => d.transaction.id !== txToRestore.id));
    setActiveUndoTx(null);
    setToastNotification(`התנועה "${txToRestore.description}" שוחזרה בהצלחה`);
  };

  const handleRestoreAllDeleted = () => {
    if (deletedTransactions.length === 0) return;
    const toRestore = deletedTransactions.map((d) => d.transaction);
    setTransactions((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const newOnes = toRestore.filter((t) => !existingIds.has(t.id));
      return [...newOnes, ...prev];
    });
    setDeletedTransactions([]);
    setActiveUndoTx(null);
    setToastNotification(`${toRestore.length} תנועות שוחזרו בהצלחה`);
  };

  const handlePermanentlyDelete = (txId: string) => {
    setDeletedTransactions((prev) => prev.filter((d) => d.transaction.id !== txId));
    if (activeUndoTx?.id === txId) {
      setActiveUndoTx(null);
    }
  };

  const handleClearTrash = () => {
    setDeletedTransactions([]);
    setActiveUndoTx(null);
    setToastNotification('סל השחזור רוקן לצמיתות');
  };

  // Keyboard shortcut: Ctrl+Z / Cmd+Z to undo last deleted transaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        const activeEl = document.activeElement;
        const isInput =
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            (activeEl as HTMLElement).isContentEditable);
        if (isInput) return;

        if (deletedTransactions.length > 0) {
          e.preventDefault();
          const mostRecent = deletedTransactions[0].transaction;
          handleRestoreTransaction(mostRecent);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletedTransactions]);

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleImportCsv = (newTxs: Transaction[], newCheckingBalance?: number) => {
    if (newTxs.length > 0) {
      setTransactions((prev) => [...newTxs, ...prev]);
    }
    if (newCheckingBalance !== undefined) {
      handleUpdateCheckingBalance(newCheckingBalance);
    }
  };

  const handleUpdateCheckingBalance = (newBalance: number) => {
    setAccounts((prev) => {
      const idx = prev.findIndex((a) => a.type === 'checking');
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          balance: newBalance,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        return updated;
      }
      if (prev.length > 0) {
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          balance: newBalance,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        return updated;
      }
      return prev;
    });
  };

  const handleUpdateCreditCardBill = (cardId: string, newTotal: number) => {
    setCreditCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, currentBillingTotal: newTotal } : c))
    );
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
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        monthlySummaries={monthlySummaries}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        onResetDemo={handleLoadDemoState}
        isDark={isDark}
        setIsDark={setIsDark}
        isDemoMode={isDemoMode}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenExcelDbModal={() => setIsExcelDbModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        currentHousehold={currentHousehold}
        currentUser={currentUser}
        isSyncing={isSyncing}
      />

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 sm:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            snapshot={snapshot}
            forecast={forecast}
            transactions={transactions}
            alerts={alerts}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            aiInsights={aiInsights}
            onAskAi={handleAskAiFromInsight}
            isDemoMode={isDemoMode}
            onOpenCsvModal={() => setIsCsvModalOpen(true)}
            onOpenDataModal={() => setIsDataModalOpen(true)}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            monthlySummaries={monthlySummaries}
            onOpenQuickBalance={() => setIsQuickBalanceOpen(true)}
            onOpenAvailableMoneyExplainer={() => setIsAvailableExplainerOpen(true)}
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
            transactions={transactions}
            setTransactions={setTransactions}
            categories={categories}
            setCategories={setCategories}
            accounts={accounts}
            creditCards={creditCards}
            merchantRules={merchantRules}
            setMerchantRules={setMerchantRules}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            deletedTransactions={deletedTransactions}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenTrashBin={() => setIsDeletedModalOpen(true)}
            onRestoreTransaction={handleRestoreTransaction}
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
            transactions={transactions}
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
            transactions={transactions}
            creditCards={creditCards}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            monthlySummaries={monthlySummaries}
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
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImport={handleImportCsv}
        existingTransactions={transactions}
        accounts={accounts}
        creditCards={creditCards}
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
          deletedTransactions,
        }}
        onRestoreBackup={handleRestoreBackup}
      />

      {/* Excel Master Database Modal */}
      <ExcelDatabaseModal
        isOpen={isExcelDbModalOpen}
        onClose={() => setIsExcelDbModalOpen(false)}
        appData={{
          accounts,
          creditCards,
          transactions,
          fixedExpenses,
          expectedIncomes,
          budgets,
          savingGoals,
          debts,
          investments,
        }}
        onRestoreData={handleRestoreExcelDatabase}
      />

      {/* Quick Balance & Credit Card Update Modal */}
      <QuickBalanceModal
        isOpen={isQuickBalanceOpen}
        onClose={() => setIsQuickBalanceOpen(false)}
        accounts={accounts}
        creditCards={creditCards}
        onUpdateCheckingBalance={handleUpdateCheckingBalance}
        onUpdateCreditCardBill={handleUpdateCreditCardBill}
        currentAvailableMoney={snapshot.realAvailableMoney}
      />

      {/* Available Money Explainer Modal */}
      <AvailableMoneyExplainerModal
        isOpen={isAvailableExplainerOpen}
        onClose={() => setIsAvailableExplainerOpen(false)}
        breakdown={snapshot.availableMoneyBreakdown}
        onOpenQuickBalance={() => setIsQuickBalanceOpen(true)}
      />

      {/* Deleted Transactions Recycle Bin Modal */}
      <DeletedTransactionsModal
        isOpen={isDeletedModalOpen}
        onClose={() => setIsDeletedModalOpen(false)}
        deletedTransactions={deletedTransactions}
        onRestore={handleRestoreTransaction}
        onRestoreAll={handleRestoreAllDeleted}
        onPermanentlyDelete={handlePermanentlyDelete}
        onClearTrash={handleClearTrash}
      />

      {/* Undo Toast Floating Notification */}
      <UndoToast
        transaction={activeUndoTx}
        notificationMessage={toastNotification}
        onUndo={() => {
          if (activeUndoTx) {
            handleRestoreTransaction(activeUndoTx);
          }
        }}
        onDismiss={() => {
          setActiveUndoTx(null);
          setToastNotification(null);
        }}
        onOpenTrashBin={() => setIsDeletedModalOpen(true)}
        deletedCount={deletedTransactions.length}
      />

      {/* Household Cloud Sync & Couple Sharing Modal */}
      <HouseholdSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentUser={currentUser}
        currentHousehold={currentHousehold}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
        onManualSync={handleManualSync}
        onCreateHousehold={handleCreateHousehold}
        onJoinHousehold={handleJoinHousehold}
        onInviteSpouse={handleInviteSpouse}
        prefilledInviteCode={prefilledInviteCode}
      />
    </div>
  );
}
