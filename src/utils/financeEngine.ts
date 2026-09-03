import {
  Account,
  CreditCard,
  Transaction,
  FixedExpense,
  ExpectedIncome,
  SavingGoal,
  Debt,
  Investment,
  FinancialSnapshot,
  DayForecast,
  WhatIfScenario,
  Budget,
} from '../types';

export function calculateSnapshot(
  accounts: Account[],
  creditCards: CreditCard[],
  transactions: Transaction[],
  fixedExpenses: FixedExpense[],
  expectedIncomes: ExpectedIncome[],
  savingGoals: SavingGoal[] = [],
  debts: Debt[] = [],
  investments: Investment[] = [],
  budgets: Budget[] = [],
  currentDate: any = new Date()
): FinancialSnapshot {
  const safeDate =
    currentDate instanceof Date && !isNaN(currentDate.getTime())
      ? currentDate
      : typeof currentDate === 'string' || typeof currentDate === 'number'
      ? new Date(currentDate)
      : new Date();

  const currentDay = safeDate.getDate();
  const currentYear = safeDate.getFullYear();
  const currentMonth = safeDate.getMonth() + 1; // 1-12
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

  // 1. Current liquid checking balance
  const checkingAccounts = accounts.filter((a) => a.type === 'checking');
  const currentCheckingBalance = checkingAccounts.reduce((sum, a) => sum + a.balance, 0);

  // 2. Month actual income & expense
  let monthIncomeActual = 0;
  let monthExpenseActual = 0;
  const categorySpendMap: Record<string, number> = {};

  const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  for (const tx of transactions) {
    if (tx.date.startsWith(currentMonthPrefix)) {
      if (tx.type === 'income') {
        monthIncomeActual += tx.amount;
      } else {
        monthExpenseActual += tx.amount;
        categorySpendMap[tx.category] = (categorySpendMap[tx.category] || 0) + tx.amount;
      }
    }
  }

  // 3. Pending incomes this month (after today or unreceived)
  const pendingIncomesThisMonth = expectedIncomes
    .filter((inc) => !inc.isReceivedThisMonth && inc.dayOfMonth >= currentDay)
    .reduce((sum, inc) => sum + inc.amount, 0);

  // 4. Pending fixed expenses this month (after today or unpaid)
  const pendingFixedExpenses = fixedExpenses
    .filter((fe) => !fe.isPaidThisMonth && fe.dayOfMonth >= currentDay)
    .reduce((sum, fe) => sum + fe.amount, 0);

  // 5. Upcoming Credit card bills
  const upcomingCreditCardBills = creditCards.reduce((sum, c) => sum + c.currentBillingTotal, 0);

  // 6. Real Available Money formula:
  // Current Checking + Expected Incomes - Credit Card Charges - Pending Fixed Expenses
  const realAvailableMoney = Math.round(
    currentCheckingBalance + pendingIncomesThisMonth - upcomingCreditCardBills - pendingFixedExpenses
  );

  // 7. Estimated daily variable spending based on remaining budget or past days
  const dailyRecommendedBudget = Math.max(0, Math.round(realAvailableMoney / daysRemaining));

  // 8. Projected End of Month Balance
  // Assume baseline prudent daily spending of dailyRecommendedBudget * daysRemaining, or what remains
  const projectedEndOfMonthBalance = Math.round(realAvailableMoney);

  // 9. Month Health Status
  let monthStatus: 'good' | 'warning' | 'danger' = 'good';
  let statusExplanation = 'החודש מתנהל בצורה מאוזנת ותקינה, צפוי להסתיים בעודף תזרימי.';

  const isBrandNewCleanState =
    transactions.length === 0 &&
    accounts.every((a) => a.balance === 0) &&
    fixedExpenses.length === 0;

  if (isBrandNewCleanState) {
    monthStatus = 'good';
    statusExplanation = 'גרסה נקייה מוכנה להזנה — הזינו יתרת עו״ש ראשונית כדי להתחיל לנהל תזרים.';
  } else if (realAvailableMoney < 0) {
    monthStatus = 'danger';
    statusExplanation = 'זהירות: גירעון צפוי בתזרים עקב חיובי אשראי והוצאות קבועות שעולות על היתרה.';
  } else if (realAvailableMoney < 1500) {
    monthStatus = 'warning';
    statusExplanation = 'תשומת לב: מרווח הביטחון התזרימי נמוך עד סוף החודש. מומלץ לצמצם הוצאות משתנות.';
  }

  // 10. Financial Score (0 - 100)
  // Sub-scores: Cashflow (0-30), Savings (0-25), Budget Control (0-25), Debt Health (0-20)
  const cashflowScore = Math.min(30, Math.max(0, Math.round(realAvailableMoney > 0 ? 25 + Math.min(5, realAvailableMoney / 1000) : 10)));
  const totalSaved = savingGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = savingGoals.reduce((s, g) => s + g.targetAmount, 0) || 1;
  const savingsScore = Math.min(25, Math.round((totalSaved / totalTarget) * 25));

  // Budget discipline
  const overBudgetCount = budgets.filter((b) => b.spentSoFar > b.monthlyLimit).length;
  const budgetControlScore = Math.max(5, 25 - overBudgetCount * 7);

  // Debt ratio
  const totalDebtMonthly = debts.reduce((s, d) => s + d.monthlyPayment, 0);
  const totalExpectedMonthlyIncome = expectedIncomes.reduce((s, i) => s + i.amount, 0) || 20000;
  const debtToIncome = totalDebtMonthly / totalExpectedMonthlyIncome;
  const debtHealthScore = debtToIncome < 0.25 ? 20 : debtToIncome < 0.4 ? 14 : 8;

  const financialScore = Math.min(100, Math.max(10, cashflowScore + savingsScore + budgetControlScore + debtHealthScore));

  // 11. Net worth
  const totalAssets =
    accounts.reduce((s, a) => s + a.balance, 0) +
    investments.reduce((s, i) => s + i.currentValue, 0);
  const totalDebts = debts.reduce((s, d) => s + d.totalRemaining, 0);
  const netWorth = totalAssets - totalDebts;

  // 12. Top Expense Categories
  const totalSpent = Object.values(categorySpendMap).reduce((s, v) => s + v, 0) || 1;
  const topExpenseCategories = Object.entries(categorySpendMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / totalSpent) * 100),
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    currentCheckingBalance,
    realAvailableMoney,
    projectedEndOfMonthBalance,
    dailyRecommendedBudget,
    monthIncomeActual,
    monthExpenseActual,
    pendingIncomesThisMonth,
    pendingFixedExpenses,
    upcomingCreditCardBills,
    monthStatus,
    statusExplanation,
    financialScore,
    scoreBreakdown: {
      cashflowScore,
      savingsScore,
      budgetControlScore,
      debtHealthScore,
    },
    totalAssets,
    totalDebts,
    netWorth,
    topExpenseCategories,
  };
}

export function generateDailyCashflowForecast(
  accountsOrBalance: Account[] | number,
  creditCardsOrIncomes: any = [],
  fixedExpenses: FixedExpense[] = [],
  expectedIncomesOrCards: any = [],
  currentDate: any = new Date(),
  dailyRecommendedBudget?: number
): DayForecast[] {
  // Support both passing Account[] array or direct number balance
  let runningBalance = 0;
  if (typeof accountsOrBalance === 'number') {
    runningBalance = accountsOrBalance;
  } else if (Array.isArray(accountsOrBalance)) {
    const checkingAccounts = accountsOrBalance.filter((a) => a.type === 'checking');
    runningBalance = checkingAccounts.reduce((sum, a) => sum + a.balance, 0);
  }

  // Detect if creditCards and expectedIncomes were swapped in caller
  let creditCards: CreditCard[] = [];
  let expectedIncomes: ExpectedIncome[] = [];

  if (Array.isArray(creditCardsOrIncomes) && creditCardsOrIncomes.length > 0 && 'billingDay' in creditCardsOrIncomes[0]) {
    creditCards = creditCardsOrIncomes;
    expectedIncomes = expectedIncomesOrCards || [];
  } else if (Array.isArray(creditCardsOrIncomes) && creditCardsOrIncomes.length > 0 && 'dayOfMonth' in creditCardsOrIncomes[0] && !('billingDay' in creditCardsOrIncomes[0])) {
    // creditCardsOrIncomes is expectedIncomes
    expectedIncomes = creditCardsOrIncomes;
    creditCards = Array.isArray(expectedIncomesOrCards) ? expectedIncomesOrCards : [];
  } else {
    creditCards = Array.isArray(creditCardsOrIncomes) ? creditCardsOrIncomes : [];
    expectedIncomes = Array.isArray(expectedIncomesOrCards) ? expectedIncomesOrCards : [];
  }

  // Safely parse currentDate into a valid Date object
  let safeDate: Date;
  if (currentDate instanceof Date && !isNaN(currentDate.getTime())) {
    safeDate = currentDate;
  } else if (typeof currentDate === 'string') {
    const parsed = new Date(currentDate);
    safeDate = isNaN(parsed.getTime()) ? new Date() : parsed;
  } else {
    // If currentDate is a number (e.g. dailyBudget accidentally passed as 5th argument) or undefined/invalid
    safeDate = new Date();
  }

  const currentDay = safeDate.getDate();
  const currentYear = safeDate.getFullYear();
  const currentMonth = safeDate.getMonth() + 1;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const forecast: DayForecast[] = [];

  // Determine estimated daily cost
  const estimatedDailyCost =
    typeof dailyRecommendedBudget === 'number' && dailyRecommendedBudget > 0
      ? dailyRecommendedBudget
      : 110;

  for (let day = currentDay; day <= daysInMonth; day++) {
    const events: Array<{ name: string; amount: number; type: 'income' | 'expense' }> = [];
    let netDayChange = 0;

    // Check incomes on this day
    for (const inc of expectedIncomes) {
      if (inc && inc.dayOfMonth === day && !inc.isReceivedThisMonth) {
        netDayChange += inc.amount;
        events.push({ name: inc.name, amount: inc.amount, type: 'income' });
      }
    }

    // Check fixed expenses on this day
    for (const fe of (fixedExpenses || [])) {
      if (fe && fe.dayOfMonth === day && !fe.isPaidThisMonth) {
        netDayChange -= fe.amount;
        events.push({ name: fe.name, amount: fe.amount, type: 'expense' });
      }
    }

    // Check credit card debits on this day
    for (const cc of creditCards) {
      if (cc && cc.billingDay === day && cc.currentBillingTotal > 0) {
        netDayChange -= cc.currentBillingTotal;
        events.push({
          name: `חיוב ${cc.name}`,
          amount: cc.currentBillingTotal,
          type: 'expense',
        });
      }
    }

    // Apply daily variable spending
    netDayChange -= estimatedDailyCost;

    runningBalance += netDayChange;

    forecast.push({
      day,
      dateStr: `${day}/${currentMonth}`,
      projectedBalance: Math.round(runningBalance),
      netDayChange: Math.round(netDayChange),
      events,
    });
  }

  return forecast;
}

export function runWhatIfSimulation(
  baselineSnapshot: FinancialSnapshot,
  baselineForecast: DayForecast[],
  scenario: any
): {
  simulatedSnapshot: FinancialSnapshot;
  simulatedForecast: DayForecast[];
  difference: number;
  causesOverdraft: boolean;
  recommendation: string;
  projectedBalanceNew: number;
} {
  let impact = 0;
  if (scenario.type === 'one_time_expense' || scenario.type === 'expense') {
    impact = -scenario.amount;
  } else if (scenario.type === 'recurring_expense') {
    impact = -scenario.amount;
  } else if (scenario.type === 'income_boost' || scenario.type === 'income') {
    impact = scenario.amount;
  } else if (scenario.type === 'cancel_subscription' || scenario.type === 'cancel_expense') {
    impact = scenario.amount;
  } else if (scenario.type === 'increase_savings') {
    impact = -scenario.amount;
  } else if (scenario.type === 'new_loan') {
    impact = scenario.amount;
  }

  const simulatedAvailable = baselineSnapshot.realAvailableMoney + impact;
  const simulatedEOM = baselineSnapshot.projectedEndOfMonthBalance + impact;
  const causesOverdraft = simulatedEOM < 0 || simulatedAvailable < 0;

  let simulatedStatus: 'good' | 'warning' | 'danger' = 'good';
  let explanation = '';
  let recommendation = '';

  if (causesOverdraft) {
    simulatedStatus = 'danger';
    explanation = 'תרחיש זה יכניס את התזרים שלך לגירעון או חריגה מיתרה עד סוף החודש!';
    recommendation = 'מומלץ לדחות את ההוצאה לחודש הבא או לחלק לפריסת תשלומים רחבה יותר.';
  } else if (simulatedAvailable < 1500) {
    simulatedStatus = 'warning';
    explanation = 'מרווח הביטחון התזרימי מצטמצם משמעותית לפחות מ-₪1,500.';
    recommendation = 'ההוצאה אפשרית אך תדרוש צמצום בהוצאות משתנות יומיות עד סוף החודש.';
  } else {
    simulatedStatus = 'good';
    explanation = 'התזרים נשאר יציב וחיובי גם לאחר מימוש תרחיש זה.';
    recommendation = 'התזרים בריא. תוכל לבצע הוצאה זו בבטחה ללא פגיעה בהתחייבויות שוטפות.';
  }

  const daysCount = baselineForecast.length || 1;
  const simulatedDaily = Math.max(0, Math.round(simulatedAvailable / daysCount));

  const simulatedSnapshot: FinancialSnapshot = {
    ...baselineSnapshot,
    realAvailableMoney: simulatedAvailable,
    projectedEndOfMonthBalance: simulatedEOM,
    dailyRecommendedBudget: simulatedDaily,
    monthStatus: simulatedStatus,
    statusExplanation: explanation,
  };

  const simulatedForecast = baselineForecast.map((f, idx) => {
    return {
      ...f,
      projectedBalance: Math.round(f.projectedBalance + impact),
    };
  });

  return {
    simulatedSnapshot,
    simulatedForecast,
    difference: impact,
    causesOverdraft,
    recommendation,
    projectedBalanceNew: simulatedEOM,
  };
}

export function detectAnomalies(
  transactions: Transaction[],
  budgets: Budget[]
): any[] {
  const alerts: any[] = [];

  // Check budgets exceeding 80%
  for (const b of budgets) {
    if (b.spentSoFar > b.monthlyLimit) {
      alerts.push({
        id: `alt-b-${b.categoryId}`,
        type: 'budget_warning',
        title: `חריגה מתקציב ${b.categoryName}`,
        message: `ההוצאה (₪${b.spentSoFar.toLocaleString()}) עברה את היעד החודשי (₪${b.monthlyLimit.toLocaleString()}).`,
        severity: 'danger',
        date: new Date().toISOString().slice(0, 10),
      });
    } else if (b.spentSoFar > b.monthlyLimit * 0.8) {
      alerts.push({
        id: `alt-b-${b.categoryId}`,
        type: 'budget_warning',
        title: `התקרבות לתקרת תקציב ${b.categoryName}`,
        message: `נוצלו ${( (b.spentSoFar / b.monthlyLimit) * 100 ).toFixed(0)}% מהתקציב החודשי.`,
        severity: 'warning',
        date: new Date().toISOString().slice(0, 10),
      });
    }
  }

  // Check single high transactions (spikes > 1500)
  for (const tx of transactions.slice(0, 15)) {
    if (tx.type === 'expense' && tx.amount >= 1500) {
      alerts.push({
        id: `alt-tx-${tx.id}`,
        type: 'spike',
        title: `הוצאה גבוהה: ${tx.description}`,
        message: `חיוב בסך ₪${tx.amount.toLocaleString()} זוהה בתאריך ${tx.date}.`,
        amount: tx.amount,
        severity: 'info',
        date: tx.date,
      });
      break;
    }
  }

  return alerts;
}

export function autoCategorizeMerchant(
  description: string,
  userRules: Record<string, string>
): string {
  const descLower = description.toLowerCase();
  for (const [kw, cat] of Object.entries(userRules)) {
    if (descLower.includes(kw.toLowerCase())) {
      return cat;
    }
  }
  return 'שונות';
}
