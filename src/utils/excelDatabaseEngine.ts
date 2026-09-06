import * as XLSX from 'xlsx';
import {
  Account,
  CreditCard,
  Transaction,
  Budget,
  FixedExpense,
  ExpectedIncome,
  SavingGoal,
  Debt,
  Investment,
  AccountType,
  TransactionType,
  IncomeKind,
  DebtType,
  InvestmentType,
} from '../types';

export interface ExcelDatabaseData {
  accounts: Account[];
  creditCards: CreditCard[];
  transactions: Transaction[];
  budgets: Budget[];
  fixedExpenses: FixedExpense[];
  expectedIncomes: ExpectedIncome[];
  savingGoals: SavingGoal[];
  debts: Debt[];
  investments: Investment[];
}

export interface ExcelDatabaseParseResult {
  data: ExcelDatabaseData;
  stats: {
    accountsCount: number;
    creditCardsCount: number;
    transactionsCount: number;
    budgetsCount: number;
    fixedExpensesCount: number;
    expectedIncomesCount: number;
    savingGoalsCount: number;
    debtsCount: number;
    investmentsCount: number;
  };
  sourceFileName: string;
}

/**
 * Sheet names in Hebrew for intuitive editing in Excel / Google Sheets
 */
export const SHEET_NAMES = {
  TRANSACTIONS: 'תנועות_פיננסיות',
  ACCOUNTS: 'חשבונות_בנק',
  CARDS: 'כרטיסי_אשראי',
  BUDGETS: 'תקציבים_חודשיים',
  FIXED_EXPENSES: 'הוצאות_קבועות',
  EXPECTED_INCOMES: 'הכנסות_צפויות',
  SAVINGS: 'יעדי_חיסכון',
  DEBTS: 'הלוואות_וחובות',
  INVESTMENTS: 'השקעות_ונכסים',
  README: 'הוראות_שימוש',
} as const;

/**
 * Exports the complete application database state to a single multi-sheet Excel file (.xlsx)
 */
export function exportExcelDatabase(data: ExcelDatabaseData, filename?: string): void {
  const workbook = XLSX.utils.book_new();

  // 1. Transactions Sheet
  const transactionsRows = data.transactions.map((tx) => ({
    'מזהה תנועה (ID)': tx.id,
    'תאריך': tx.date,
    'תיאור': tx.description,
    'סכום (₪)': tx.amount,
    'סוג (הוצאה / הכנסה)': tx.type === 'expense' ? 'הוצאה' : 'הכנסה',
    'קטגוריה': tx.category,
    'תת קטגוריה': tx.subCategory || '',
    'מזהה חשבון משויך': tx.accountId || '',
    'מזהה כרטיס אשראי': tx.creditCardId || '',
    'אמצעי תשלום': tx.paymentMethod || (tx.creditCardId ? 'credit_card' : 'checking'),
    'תשלום קבוע? (כן/לא)': tx.isFixed ? 'כן' : 'לא',
    'תשלום חוזר? (כן/לא)': tx.isRecurring ? 'כן' : 'לא',
    'הוצאה עסקית? (כן/לא)': tx.isBusiness ? 'כן' : 'לא',
    'תשלום נוכחי': tx.installments ? tx.installments.current : 1,
    'סך תשלומים': tx.installments ? tx.installments.total : 1,
    'שיוך בן משפחה': tx.familyMember || '',
    'הערות': tx.notes || '',
  }));
  const txSheet = XLSX.utils.json_to_sheet(transactionsRows);
  XLSX.utils.book_append_sheet(workbook, txSheet, SHEET_NAMES.TRANSACTIONS);

  // 2. Accounts Sheet
  const accountsRows = data.accounts.map((acc) => ({
    'מזהה חשבון (ID)': acc.id,
    'שם החשבון': acc.name,
    'סוג חשבון': acc.type,
    'שם הבנק': acc.bankName || '',
    'יתרת עו"ש נוכחית (₪)': acc.balance,
    'מטבע': acc.currency || 'ILS',
    'תאריך עדכון יתרה': acc.lastUpdated || new Date().toISOString().split('T')[0],
    'חשבון משותף? (כן/לא)': acc.isFamilyShared ? 'כן' : 'לא',
    'הערות': acc.notes || '',
  }));
  const accSheet = XLSX.utils.json_to_sheet(accountsRows);
  XLSX.utils.book_append_sheet(workbook, accSheet, SHEET_NAMES.ACCOUNTS);

  // 3. Credit Cards Sheet
  const cardsRows = data.creditCards.map((card) => ({
    'מזהה כרטיס (ID)': card.id,
    'שם הכרטיס': card.name,
    'חברת אשראי': card.company,
    '4 ספרות אחרונות': card.lastFourDigits || '',
    'מסגרת אשראי (₪)': card.limit,
    'יום חיוב בחודש': card.billingDay,
    'חיוב צפוי לחודש הנוכחי (₪)': card.currentBillingTotal,
    'סך עסקאות בתשלומים עתידיים (₪)': card.remainingInstallmentsTotal || 0,
    'מזהה חשבון בנק מקושר': card.linkedAccountId || '',
  }));
  const cardsSheet = XLSX.utils.json_to_sheet(cardsRows);
  XLSX.utils.book_append_sheet(workbook, cardsSheet, SHEET_NAMES.CARDS);

  // 4. Budgets Sheet
  const budgetsRows = data.budgets.map((b) => ({
    'מזהה קטגוריה': b.categoryId,
    'שם קטגוריה': b.categoryName,
    'תקרת תקציב חודשית (₪)': b.monthlyLimit,
    'הוצאות עד כה (₪)': b.spentSoFar || 0,
    'תחזית סוף חודש (₪)': b.projectedSpend || 0,
  }));
  const budgetsSheet = XLSX.utils.json_to_sheet(budgetsRows);
  XLSX.utils.book_append_sheet(workbook, budgetsSheet, SHEET_NAMES.BUDGETS);

  // 5. Fixed Expenses Sheet
  const fixedRows = data.fixedExpenses.map((fe) => ({
    'מזהה (ID)': fe.id,
    'שם ההוצאה הקבועה': fe.name,
    'סכום (₪)': fe.amount,
    'יום חיוב בחודש': fe.dayOfMonth,
    'קטגוריה': fe.category,
    'מזהה חשבון': fe.accountId || '',
    'שולם החודש? (כן/לא)': fe.isPaidThisMonth ? 'כן' : 'לא',
  }));
  const fixedSheet = XLSX.utils.json_to_sheet(fixedRows);
  XLSX.utils.book_append_sheet(workbook, fixedSheet, SHEET_NAMES.FIXED_EXPENSES);

  // 6. Expected Incomes Sheet
  const incomeRows = data.expectedIncomes.map((inc) => ({
    'מזהה (ID)': inc.id,
    'שם מקור ההכנסה': inc.name,
    'סכום (₪)': inc.amount,
    'יום קבלה בחודש': inc.dayOfMonth,
    'סוג הכנסה': inc.kind,
    'שם המקבל/בן הזוג': inc.recipient || '',
    'התקבלה החודש? (כן/לא)': inc.isReceivedThisMonth ? 'כן' : 'לא',
  }));
  const incomeSheet = XLSX.utils.json_to_sheet(incomeRows);
  XLSX.utils.book_append_sheet(workbook, incomeSheet, SHEET_NAMES.EXPECTED_INCOMES);

  // 7. Saving Goals Sheet
  const savingsRows = data.savingGoals.map((sg) => ({
    'מזהה יעד (ID)': sg.id,
    'שם יעד החיסכון': sg.name,
    'סכום יעד (₪)': sg.targetAmount,
    'סכום שנצבר עד כה (₪)': sg.currentAmount,
    'הפקדה חודשית (₪)': sg.monthlyDeposit || sg.monthlyTargetDeposit || 0,
    'תאריך יעד': sg.targetDate || '',
    'קטגוריה': sg.category || 'כללי',
    'צבע תגית': sg.color || '#00B894',
  }));
  const savingsSheet = XLSX.utils.json_to_sheet(savingsRows);
  XLSX.utils.book_append_sheet(workbook, savingsSheet, SHEET_NAMES.SAVINGS);

  // 8. Debts / Loans Sheet
  const debtsRows = data.debts.map((d) => ({
    'מזהה הלוואה (ID)': d.id,
    'שם ההלוואה / חוב': d.name,
    'סוג': d.type,
    'יתרת קרן לתשלום (₪)': d.currentBalance ?? d.totalRemaining ?? 0,
    'סכום הלוואה מקורי (₪)': d.originalAmount || 0,
    'ריבית שנתית (%)': d.interestRate,
    'החזר חודשי (₪)': d.monthlyPayment,
    'תשלומים שנותרו': d.remainingPayments || 0,
    'תאריך סיום צפוי': d.endDate || '',
    'גוף מממן': d.lender || '',
  }));
  const debtsSheet = XLSX.utils.json_to_sheet(debtsRows);
  XLSX.utils.book_append_sheet(workbook, debtsSheet, SHEET_NAMES.DEBTS);

  // 9. Investments Sheet
  const investmentsRows = data.investments.map((inv) => ({
    'מזהה השקעה (ID)': inv.id,
    'שם ההשקעה / קופה': inv.name,
    'סוג נכס': inv.type,
    'שווי נוכחי (₪)': inv.currentValue,
    'תשואה שנתית מוערכת (%)': inv.annualReturnPct ?? inv.annualReturnRate ?? 0,
    'דמי ניהול (%)': inv.managementFeePct || 0,
    'גוף מנהל': inv.institution || inv.provider || '',
    'הפקדה חודשית (₪)': inv.monthlyDeposit || 0,
    'הערות': inv.notes || '',
  }));
  const invSheet = XLSX.utils.json_to_sheet(investmentsRows);
  XLSX.utils.book_append_sheet(workbook, invSheet, SHEET_NAMES.INVESTMENTS);

  // 10. Readme / Instructions Sheet
  const readmeRows = [
    {
      'הנחיה': 'קובץ זה הינו מסד נתונים מלא (Master Database) של המערכת הפיננסית שלך FinSmart.',
      'פרטים נוספים': 'ניתן לערוך, להוסיף שורות חדשות, או לשנות יתרות ישירות באקסל או ב-Google Sheets.',
    },
    {
      'הנחיה': 'טעינת הנתונים לאפליקציה:',
      'פרטים נוספים': 'באפליקציה, לחץ על "מסד נתונים אקסל" -> "טעינה וסנכרון מאקסל" ובחר בקובץ זה.',
    },
    {
      'הנחיה': 'הוספת תנועה חדשה ישירות באקסל:',
      'פרטים נוספים': 'הוסף שורה בגיליון "תנועות_פיננסיות" עם תאריך, תיאור, סכום, וקטגוריה. המזהה (ID) יכול להישאר ריק והאפליקציה תיצור אותו אוטומטית.',
    },
    {
      'הנחיה': 'פרטיות מוחלטת:',
      'פרטים נוספים': 'הקובץ נשמר אצלך במחשב, ב-Google Drive, או ב-OneDrive. אין שום תלות בשרת ענן חיצוני או שגיאות התחברות.',
    },
  ];
  const readmeSheet = XLSX.utils.json_to_sheet(readmeRows);
  XLSX.utils.book_append_sheet(workbook, readmeSheet, SHEET_NAMES.README);

  // Trigger Download
  const dateStr = new Date().toISOString().slice(0, 10);
  const finalFilename = filename || `FinSmart_Database_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, finalFilename);
}

/**
 * Parses an uploaded Excel file (.xlsx or .xls) and reconstructs the full FinSmart application data
 */
export async function parseExcelDatabase(file: File): Promise<ExcelDatabaseParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const result: ExcelDatabaseData = {
    accounts: [],
    creditCards: [],
    transactions: [],
    budgets: [],
    fixedExpenses: [],
    expectedIncomes: [],
    savingGoals: [],
    debts: [],
    investments: [],
  };

  // Helper to find a worksheet by Hebrew name or english fallback
  const getSheet = (name: string, fallbackName?: string): any[] => {
    let sheet = workbook.Sheets[name];
    if (!sheet && fallbackName) {
      sheet = workbook.Sheets[fallbackName];
    }
    if (!sheet) {
      // Find case-insensitive match or substring match
      const key = workbook.SheetNames.find(
        (s) => s.includes(name) || (fallbackName && s.toLowerCase().includes(fallbackName.toLowerCase()))
      );
      if (key) sheet = workbook.Sheets[key];
    }
    if (!sheet) return [];
    return XLSX.utils.sheet_to_json(sheet);
  };

  // 1. Transactions
  const rawTransactions = getSheet(SHEET_NAMES.TRANSACTIONS, 'transactions');
  if (rawTransactions.length > 0) {
    result.transactions = rawTransactions
      .map((row: any, idx: number) => {
        const id = String(row['מזהה תנועה (ID)'] || row['id'] || `tx_xl_${Date.now()}_${idx}`);
        const date = String(row['תאריך'] || row['date'] || new Date().toISOString().slice(0, 10));
        const description = String(row['תיאור'] || row['description'] || row['שם בית עסק'] || 'תנועה מאקסל');
        const amount = Math.abs(parseFloat(row['סכום (₪)'] ?? row['amount'] ?? 0));
        const typeStr = String(row['סוג (הוצאה / הכנסה)'] || row['type'] || '').toLowerCase();
        const type: TransactionType = typeStr.includes('הכנסה') || typeStr === 'income' ? 'income' : 'expense';
        const category = String(row['קטגוריה'] || row['category'] || 'שונות');
        const subCategory = row['תת קטגוריה'] || row['subCategory'] || undefined;
        const accountId = String(row['מזהה חשבון משויך'] || row['accountId'] || 'acc_1');
        const creditCardId = row['מזהה כרטיס אשראי'] || row['creditCardId'] || undefined;

        let rawPaymentMethod = String(row['אמצעי תשלום'] || row['paymentMethod'] || '');
        let paymentMethod: 'checking' | 'credit_card' | 'bank_transfer' | 'cash' = 'checking';
        if (creditCardId || rawPaymentMethod.includes('אשראי') || rawPaymentMethod === 'credit_card') {
          paymentMethod = 'credit_card';
        } else if (rawPaymentMethod.includes('העברה') || rawPaymentMethod === 'bank_transfer') {
          paymentMethod = 'bank_transfer';
        } else if (rawPaymentMethod.includes('מזומן') || rawPaymentMethod === 'cash') {
          paymentMethod = 'cash';
        }

        const isFixed = String(row['תשלום קבוע? (כן/לא)'] || row['isFixed']).includes('כן') || Boolean(row['isFixed']);
        const isRecurring = String(row['תשלום חוזר? (כן/לא)'] || row['isRecurring']).includes('כן') || Boolean(row['isRecurring']);
        const isBusiness = String(row['הוצאה עסקית? (כן/לא)'] || row['isBusiness']).includes('כן') || Boolean(row['isBusiness']);
        
        const currInst = parseInt(row['תשלום נוכחי'] || '1', 10);
        const totalInst = parseInt(row['סך תשלומים'] || '1', 10);
        const installments = totalInst > 1 ? { current: currInst, total: totalInst } : undefined;

        const tx: Transaction = {
          id,
          date,
          description,
          amount,
          type,
          category,
          subCategory,
          accountId,
          creditCardId,
          paymentMethod,
          isFixed,
          isRecurring,
          isBusiness,
          installments,
          familyMember: row['שיוך בן משפחה'] || row['familyMember'] || undefined,
          notes: row['הערות'] || row['notes'] || undefined,
        };
        return tx;
      })
      .filter((t) => t.amount > 0 || t.description.length > 0);
  }

  // 2. Accounts
  const rawAccounts = getSheet(SHEET_NAMES.ACCOUNTS, 'accounts');
  if (rawAccounts.length > 0) {
    result.accounts = rawAccounts.map((row: any, idx: number) => {
      const id = String(row['מזהה חשבון (ID)'] || row['id'] || `acc_${idx + 1}`);
      const name = String(row['שם החשבון'] || row['name'] || `חשבון ${idx + 1}`);
      const rawType = String(row['סוג חשבון'] || row['type'] || 'checking').toLowerCase();
      let type: AccountType = 'checking';
      if (rawType.includes('חיסכון') || rawType === 'savings') type = 'savings';
      else if (rawType.includes('השקע') || rawType === 'investment') type = 'investment';
      else if (rawType.includes('מזומן') || rawType === 'cash') type = 'cash';
      else if (rawType.includes('אחר') || rawType === 'other') type = 'other';

      const balance = parseFloat(row['יתרת עו"ש נוכחית (₪)'] ?? row['balance'] ?? 0);
      const isFamilyShared = String(row['חשבון משותף? (כן/לא)'] || '').includes('כן') || Boolean(row['isFamilyShared']);

      const acc: Account = {
        id,
        name,
        type,
        balance: isNaN(balance) ? 0 : balance,
        currency: String(row['מטבע'] || 'ILS'),
        bankName: String(row['שם הבנק'] || row['bankName'] || 'בנק כללי'),
        lastUpdated: String(row['תאריך עדכון יתרה'] || new Date().toISOString().split('T')[0]),
        isFamilyShared,
        notes: row['הערות'] || undefined,
      };
      return acc;
    });
  }

  // 3. Credit Cards
  const rawCards = getSheet(SHEET_NAMES.CARDS, 'cards');
  if (rawCards.length > 0) {
    result.creditCards = rawCards.map((row: any, idx: number) => {
      const id = String(row['מזהה כרטיס (ID)'] || row['id'] || `card_${idx + 1}`);
      const name = String(row['שם הכרטיס'] || row['name'] || `כרטיס ${idx + 1}`);
      const card: CreditCard = {
        id,
        name,
        company: String(row['חברת אשראי'] || row['company'] || 'ישראכרט'),
        lastFourDigits: String(row['4 ספרות אחרונות'] || row['lastFourDigits'] || '0000'),
        limit: parseFloat(row['מסגרת אשראי (₪)'] ?? row['limit'] ?? 10000),
        billingDay: parseInt(row['יום חיוב בחודש'] ?? row['billingDay'] ?? '10', 10),
        currentBillingTotal: parseFloat(row['חיוב צפוי לחודש הנוכחי (₪)'] ?? row['currentBillingTotal'] ?? 0),
        remainingInstallmentsTotal: parseFloat(row['סך עסקאות בתשלומים עתידיים (₪)'] ?? row['remainingInstallmentsTotal'] ?? 0),
        linkedAccountId: String(row['מזהה חשבון בנק מקושר'] || row['linkedAccountId'] || 'acc_1'),
      };
      return card;
    });
  }

  // 4. Budgets
  const rawBudgets = getSheet(SHEET_NAMES.BUDGETS, 'budgets');
  if (rawBudgets.length > 0) {
    result.budgets = rawBudgets.map((row: any, idx: number) => {
      const categoryName = String(row['שם קטגוריה'] || row['categoryName'] || `קטגוריה ${idx + 1}`);
      const categoryId = String(row['מזהה קטגוריה'] || row['categoryId'] || `cat_${idx + 1}`);
      const monthlyLimit = parseFloat(row['תקרת תקציב חודשית (₪)'] ?? row['monthlyLimit'] ?? 0);
      const spentSoFar = parseFloat(row['הוצאות עד כה (₪)'] ?? row['spentSoFar'] ?? 0);
      const projectedSpend = parseFloat(row['תחזית סוף חודש (₪)'] ?? row['projectedSpend'] ?? spentSoFar);

      const budget: Budget = {
        categoryId,
        categoryName,
        monthlyLimit: isNaN(monthlyLimit) ? 0 : monthlyLimit,
        spentSoFar: isNaN(spentSoFar) ? 0 : spentSoFar,
        projectedSpend: isNaN(projectedSpend) ? 0 : projectedSpend,
      };
      return budget;
    });
  }

  // 5. Fixed Expenses
  const rawFixed = getSheet(SHEET_NAMES.FIXED_EXPENSES, 'fixedExpenses');
  if (rawFixed.length > 0) {
    result.fixedExpenses = rawFixed.map((row: any, idx: number) => {
      const id = String(row['מזהה (ID)'] || row['id'] || `fe_${idx + 1}`);
      const name = String(row['שם ההוצאה הקבועה'] || row['name'] || `הוצאה ${idx + 1}`);
      const amount = parseFloat(row['סכום (₪)'] ?? row['amount'] ?? 0);
      const isPaid = String(row['שולם החודש? (כן/לא)'] || '').includes('כן') || Boolean(row['isPaidThisMonth']);

      const fe: FixedExpense = {
        id,
        name,
        amount: isNaN(amount) ? 0 : amount,
        dayOfMonth: parseInt(row['יום חיוב בחודש'] ?? row['dayOfMonth'] ?? '1', 10),
        category: String(row['קטגוריה'] || row['category'] || 'דיור'),
        accountId: row['מזהה חשבון'] || row['accountId'] || undefined,
        isPaidThisMonth: isPaid,
      };
      return fe;
    });
  }

  // 6. Expected Incomes
  const rawIncomes = getSheet(SHEET_NAMES.EXPECTED_INCOMES, 'expectedIncomes');
  if (rawIncomes.length > 0) {
    result.expectedIncomes = rawIncomes.map((row: any, idx: number) => {
      const id = String(row['מזהה (ID)'] || row['id'] || `inc_${idx + 1}`);
      const name = String(row['שם מקור ההכנסה'] || row['name'] || `משכורת ${idx + 1}`);
      const amount = parseFloat(row['סכום (₪)'] ?? row['amount'] ?? 0);
      const rawKind = String(row['סוג הכנסה'] || row['kind'] || 'salary').toLowerCase();
      let kind: IncomeKind = 'salary';
      if (rawKind.includes('עסק') || rawKind === 'business') kind = 'business';
      else if (rawKind.includes('קבוע') || rawKind === 'recurring') kind = 'recurring';
      else if (rawKind.includes('חד') || rawKind === 'one_time') kind = 'one_time';

      const isReceived = String(row['התקבלה החודש? (כן/לא)'] || '').includes('כן') || Boolean(row['isReceivedThisMonth']);

      const inc: ExpectedIncome = {
        id,
        name,
        amount: isNaN(amount) ? 0 : amount,
        dayOfMonth: parseInt(row['יום קבלה בחודש'] ?? row['dayOfMonth'] ?? '10', 10),
        kind,
        recipient: row['שם המקבל/בן הזוג'] || row['recipient'] || undefined,
        isReceivedThisMonth: isReceived,
      };
      return inc;
    });
  }

  // 7. Savings Goals
  const rawSavings = getSheet(SHEET_NAMES.SAVINGS, 'savings');
  if (rawSavings.length > 0) {
    result.savingGoals = rawSavings.map((row: any, idx: number) => {
      const id = String(row['מזהה יעד (ID)'] || row['id'] || `sg_${idx + 1}`);
      const name = String(row['שם יעד החיסכון'] || row['name'] || `חיסכון ${idx + 1}`);
      const sg: SavingGoal = {
        id,
        name,
        targetAmount: parseFloat(row['סכום יעד (₪)'] ?? row['targetAmount'] ?? 10000),
        currentAmount: parseFloat(row['סכום שנצבר עד כה (₪)'] ?? row['currentAmount'] ?? 0),
        monthlyDeposit: parseFloat(row['הפקדה חודשית (₪)'] ?? row['monthlyDeposit'] ?? 0),
        targetDate: String(row['תאריך יעד'] || row['targetDate'] || '2026-12-31'),
        category: String(row['קטגוריה'] || row['category'] || 'כללי'),
        color: row['צבע תגית'] || row['color'] || '#00B894',
      };
      return sg;
    });
  }

  // 8. Debts
  const rawDebts = getSheet(SHEET_NAMES.DEBTS, 'debts');
  if (rawDebts.length > 0) {
    result.debts = rawDebts.map((row: any, idx: number) => {
      const id = String(row['מזהה הלוואה (ID)'] || row['id'] || `debt_${idx + 1}`);
      const name = String(row['שם ההלוואה / חוב'] || row['name'] || `הלוואה ${idx + 1}`);
      const rawType = String(row['סוג'] || row['type'] || 'loan').toLowerCase();
      let type: DebtType = 'loan';
      if (rawType.includes('משכנתא') || rawType === 'mortgage') type = 'mortgage';
      else if (rawType.includes('רכב') || rawType === 'car_loan') type = 'car_loan';
      else if (rawType.includes('אשראי') || rawType === 'credit') type = 'credit';

      const balance = parseFloat(row['יתרת קרן לתשלום (₪)'] ?? row['currentBalance'] ?? row['totalRemaining'] ?? 0);

      const debt: Debt = {
        id,
        name,
        type,
        currentBalance: balance,
        totalRemaining: balance,
        originalAmount: parseFloat(row['סכום הלוואה מקורי (₪)'] ?? row['originalAmount'] ?? balance),
        interestRate: parseFloat(row['ריבית שנתית (%)'] ?? row['interestRate'] ?? 3.5),
        monthlyPayment: parseFloat(row['החזר חודשי (₪)'] ?? row['monthlyPayment'] ?? 0),
        remainingPayments: parseInt(row['תשלומים שנותרו'] ?? row['remainingPayments'] ?? '12', 10),
        endDate: String(row['תאריך סיום צפוי'] || row['endDate'] || '2027-12-31'),
        lender: row['גוף מממן'] || row['lender'] || undefined,
      };
      return debt;
    });
  }

  // 9. Investments
  const rawInv = getSheet(SHEET_NAMES.INVESTMENTS, 'investments');
  if (rawInv.length > 0) {
    result.investments = rawInv.map((row: any, idx: number) => {
      const id = String(row['מזהה השקעה (ID)'] || row['id'] || `inv_${idx + 1}`);
      const name = String(row['שם ההשקעה / קופה'] || row['name'] || `קרן ${idx + 1}`);
      const rawType = String(row['סוג נכס'] || row['type'] || 'funds').toLowerCase();
      let type: InvestmentType = 'funds';
      if (rawType.includes('פנסיה') || rawType === 'pension') type = 'pension';
      else if (rawType.includes('השתלמות') || rawType === 'study_fund') type = 'study_fund';
      else if (rawType.includes('מניות') || rawType === 'stocks') type = 'stocks';
      else if (rawType.includes('קריפטו') || rawType === 'crypto') type = 'crypto';
      else if (rawType.includes('נדלן') || rawType === 'real_estate') type = 'real_estate';

      const inv: Investment = {
        id,
        name,
        type,
        currentValue: parseFloat(row['שווי נוכחי (₪)'] ?? row['currentValue'] ?? 0),
        annualReturnPct: parseFloat(row['תשואה שנתית מוערכת (%)'] ?? row['annualReturnPct'] ?? 7),
        managementFeePct: parseFloat(row['דמי ניהול (%)'] ?? row['managementFeePct'] ?? 0.5),
        institution: row['גוף מנהל'] || row['institution'] || undefined,
        monthlyDeposit: parseFloat(row['הפקדה חודשית (₪)'] ?? row['monthlyDeposit'] ?? 0),
        notes: row['הערות'] || undefined,
      };
      return inv;
    });
  }

  return {
    data: result,
    stats: {
      accountsCount: result.accounts.length,
      creditCardsCount: result.creditCards.length,
      transactionsCount: result.transactions.length,
      budgetsCount: result.budgets.length,
      fixedExpensesCount: result.fixedExpenses.length,
      expectedIncomesCount: result.expectedIncomes.length,
      savingGoalsCount: result.savingGoals.length,
      debtsCount: result.debts.length,
      investmentsCount: result.investments.length,
    },
    sourceFileName: file.name,
  };
}

/**
 * Generates and downloads a clean, ready-to-fill Master Template with Israeli standards
 */
export function downloadBlankExcelTemplate(): void {
  const sampleData: ExcelDatabaseData = {
    accounts: [
      { id: 'acc_1', name: 'חשבון עו"ש ראשי', type: 'checking', balance: 14500, currency: 'ILS', bankName: 'בנק הפועלים', lastUpdated: new Date().toISOString().split('T')[0], isFamilyShared: true },
      { id: 'acc_2', name: 'חשבון חיסכון וקרן חירום', type: 'savings', balance: 35000, currency: 'ILS', bankName: 'בנק לאומי', lastUpdated: new Date().toISOString().split('T')[0], isFamilyShared: true },
    ],
    creditCards: [
      { id: 'card_1', name: 'מאסטרקארד זהב', company: 'ישראכרט', lastFourDigits: '4821', limit: 25000, billingDay: 10, currentBillingTotal: 4200, remainingInstallmentsTotal: 1200, linkedAccountId: 'acc_1' },
      { id: 'card_2', name: 'ויזה כאל', company: 'כאל', lastFourDigits: '9103', limit: 15000, billingDay: 15, currentBillingTotal: 1850, remainingInstallmentsTotal: 0, linkedAccountId: 'acc_1' },
    ],
    transactions: [
      { id: 'tx_demo_1', date: new Date().toISOString().slice(0, 10), description: 'שופרסל דיל - קניות לבית', amount: 640, type: 'expense', category: 'מזון וסופרמרקט', accountId: 'acc_1', creditCardId: 'card_1', paymentMethod: 'credit_card', isFixed: false, isRecurring: true },
      { id: 'tx_demo_2', date: new Date().toISOString().slice(0, 10), description: 'פז - תדלוק רכב', amount: 320, type: 'expense', category: 'תחבורה ורכב', accountId: 'acc_1', creditCardId: 'card_1', paymentMethod: 'credit_card', isFixed: false, isRecurring: false },
      { id: 'tx_demo_3', date: new Date().toISOString().slice(0, 7) + '-01', description: 'משכורת חודשית', amount: 16500, type: 'income', category: 'משכורת', accountId: 'acc_1', paymentMethod: 'checking', isFixed: true, isRecurring: true },
    ],
    budgets: [
      { categoryId: 'cat_food', categoryName: 'מזון וסופרמרקט', monthlyLimit: 3200, spentSoFar: 640, projectedSpend: 2800 },
      { categoryId: 'cat_transport', categoryName: 'תחבורה ודלק', monthlyLimit: 1400, spentSoFar: 320, projectedSpend: 1100 },
      { categoryId: 'cat_dining', categoryName: 'מסעדות ובילויים', monthlyLimit: 1200, spentSoFar: 150, projectedSpend: 950 },
      { categoryId: 'cat_housing', categoryName: 'דיור ואחזקת בית', monthlyLimit: 6500, spentSoFar: 6200, projectedSpend: 6200 },
      { categoryId: 'cat_kids', categoryName: 'חינוך וילדים', monthlyLimit: 2200, spentSoFar: 800, projectedSpend: 2100 },
    ],
    fixedExpenses: [
      { id: 'fe_1', name: 'שכר דירה / משכנתא', amount: 5200, dayOfMonth: 1, category: 'דיור', isPaidThisMonth: true, accountId: 'acc_1' },
      { id: 'fe_2', name: 'ארנונה ומים', amount: 850, dayOfMonth: 10, category: 'דיור', isPaidThisMonth: false, accountId: 'acc_1' },
      { id: 'fe_3', name: 'ביטוח רכב מקיף וחובה', amount: 380, dayOfMonth: 15, category: 'תחבורה', isPaidThisMonth: false, accountId: 'acc_1' },
    ],
    expectedIncomes: [
      { id: 'inc_1', name: 'משכורת עיקרית', amount: 16500, dayOfMonth: 1, kind: 'salary', isReceivedThisMonth: true, recipient: 'בן/בת הזוג 1' },
      { id: 'inc_2', name: 'משכורת נוספת', amount: 11200, dayOfMonth: 10, kind: 'salary', isReceivedThisMonth: false, recipient: 'בן/בת הזוג 2' },
    ],
    savingGoals: [
      { id: 'sg_1', name: 'קרן חירום (3 חודשי הוצאות)', targetAmount: 50000, currentAmount: 35000, monthlyDeposit: 1500, targetDate: '2027-06-30', category: 'חירום', color: '#00B894' },
      { id: 'sg_2', name: 'חופשה משפחתית בקיץ', targetAmount: 18000, currentAmount: 9500, monthlyDeposit: 1200, targetDate: '2026-08-01', category: 'פנאי', color: '#0984E3' },
    ],
    debts: [
      { id: 'debt_1', name: 'הלוואת רכב', type: 'car_loan', currentBalance: 42000, originalAmount: 65000, interestRate: 4.2, monthlyPayment: 1450, remainingPayments: 29, endDate: '2028-11-01', lender: 'מימון ישיר' },
    ],
    investments: [
      { id: 'inv_1', name: 'קרן השתלמות מחקה S&P 500', type: 'study_fund', currentValue: 78000, annualReturnPct: 9.2, managementFeePct: 0.35, institution: 'מיטב דש', monthlyDeposit: 1570 },
      { id: 'inv_2', name: 'קופת גמל להשקעה', type: 'funds', currentValue: 45000, annualReturnPct: 7.5, managementFeePct: 0.55, institution: 'אלטשולר שחם', monthlyDeposit: 1000 },
    ],
  };

  exportExcelDatabase(sampleData, 'FinSmart_Blank_Database_Template.xlsx');
}
