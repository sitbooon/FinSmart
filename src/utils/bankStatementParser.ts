import * as XLSX from 'xlsx';
import { Transaction } from '../types';

export interface ParsedBankResult {
  transactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'expense' | 'income';
    category: string;
    subCategory: string;
    rawRow?: any;
    isDuplicate?: boolean;
    reference?: string;
  }>;
  detectedBank?: string;
  closingBalance?: number;
  totalDebits: number;
  totalCredits: number;
  totalCount: number;
}

// Israeli merchant classification dictionary
const ISRAELI_MERCHANT_CATEGORIES: Record<string, string> = {
  // Supermarket & Groceries
  שופרסל: 'סופר ומזון',
  'רמי לוי': 'סופר ומזון',
  יוחננוף: 'סופר ומזון',
  ויקטורי: 'סופר ומזון',
  'טיב טעם': 'סופר ומזון',
  'יינות ביתן': 'סופר ומזון',
  'מחסני השוק': 'סופר ומזון',
  'חצי חינם': 'סופר ומזון',
  'ampm': 'סופר ומזון',
  'am:pm': 'סופר ומזון',
  מגה: 'סופר ומזון',
  'מחסני להב': 'סופר ומזון',
  'שוק העיר': 'סופר ומזון',
  קשת: 'סופר ומזון',
  פרשמרקט: 'סופר ומזון',
  ירקות: 'סופר ומזון',
  פירות: 'סופר ומזון',
  מאפייה: 'סופר ומזון',
  מאפיית: 'סופר ומזון',
  אטליז: 'סופר ומזון',

  // Fuel, Parking & Transport
  פז: 'רכב ודלק',
  סונול: 'רכב ודלק',
  'דור אלון': 'רכב ודלק',
  דלק: 'רכב ודלק',
  טן: 'רכב ודלק',
  'סו גו': 'רכב ודלק',
  sogood: 'רכב ודלק',
  yellow: 'רכב ודלק',
  ילו: 'רכב ודלק',
  מנטה: 'רכב ודלק',
  פנגו: 'רכב ודלק',
  pango: 'רכב ודלק',
  סלופארק: 'רכב ודלק',
  cellopark: 'רכב ודלק',
  חניון: 'רכב ודלק',
  gett: 'רכב ודלק',
  גט: 'רכב ודלק',
  yango: 'רכב ודלק',
  יאנגו: 'רכב ודלק',
  מונית: 'רכב ודלק',
  רכבת: 'רכב ודלק',
  אגד: 'רכב ודלק',
  דן: 'רכב ודלק',
  מטרופולין: 'רכב ודלק',
  מוסך: 'רכב ודלק',
  טסט: 'רכב ודלק',
  רישוי: 'רכב ודלק',

  // Restaurants & Cafes
  wolt: 'מסעדות ובילויים',
  וולט: 'מסעדות ובילויים',
  'תן ביס': 'מסעדות ובילויים',
  '10bis': 'מסעדות ובילויים',
  ארומה: 'מסעדות ובילויים',
  גולדה: 'מסעדות ובילויים',
  מקדונלד: 'מסעדות ובילויים',
  mcdonalds: 'מסעדות ובילויים',
  לנדוור: 'מסעדות ובילויים',
  קפה: 'מסעדות ובילויים',
  פיצה: 'מסעדות ובילויים',
  בורגר: 'מסעדות ובילויים',
  סושי: 'מסעדות ובילויים',
  מסעדה: 'מסעדות ובילויים',
  בר: 'מסעדות ובילויים',
  פאב: 'מסעדות ובילויים',
  שווארמה: 'מסעדות ובילויים',
  סינמה: 'מסעדות ובילויים',
  'יס פלאנט': 'מסעדות ובילויים',
  ravhen: 'מסעדות ובילויים',
  קולנוע: 'מסעדות ובילויים',

  // Subscriptions & Telecom
  netflix: 'מנויים ותקשורת',
  נטפליקס: 'מנויים ותקשורת',
  spotify: 'מנויים ותקשורת',
  ספוטיפיי: 'מנויים ותקשורת',
  apple: 'מנויים ותקשורת',
  אפל: 'מנויים ותקשורת',
  google: 'מנויים ותקשורת',
  גוגל: 'מנויים ותקשורת',
  youtube: 'מנויים ותקשורת',
  יוטיוב: 'מנויים ותקשורת',
  פרטנר: 'מנויים ותקשורת',
  סלקום: 'מנויים ותקשורת',
  פלאפון: 'מנויים ותקשורת',
  הוט: 'מנויים ותקשורת',
  hot: 'מנויים ותקשורת',
  בזק: 'מנויים ותקשורת',
  bezeq: 'מנויים ותקשורת',
  yes: 'מנויים ותקשורת',
  יס: 'מנויים ותקשורת',
  '012': 'מנויים ותקשורת',
  '019': 'מנויים ותקשורת',
  גולן: 'מנויים ותקשורת',
  wecom: 'מנויים ותקשורת',
  openai: 'מנויים ותקשורת',
  chatgpt: 'מנויים ותקשורת',

  // Home & Utilities
  חשמל: 'בית ודיור',
  ארנונה: 'בית ודיור',
  עיריית: 'בית ודיור',
  עירייה: 'בית ודיור',
  מים: 'בית ודיור',
  'מי אביבים': 'בית ודיור',
  הגיחון: 'בית ודיור',
  מיטב: 'בית ודיור',
  פלג: 'בית ודיור',
  גז: 'בית ודיור',
  אמישראגז: 'בית ודיור',
  פזגז: 'בית ודיור',
  סופרגז: 'בית ודיור',
  איקאה: 'בית ודיור',
  ikea: 'בית ודיור',
  'הום סנטר': 'בית ודיור',
  אייס: 'בית ודיור',
  ace: 'בית ודיור',
  ksp: 'בית ודיור',
  אייבורי: 'בית ודיור',
  'שקם אלקטריק': 'בית ודיור',
  מחסני: 'בית ודיור',
  טרקלין: 'בית ודיור',
  ועד: 'בית ודיור',

  // Health & Pharmacies
  'סופר פארם': 'בריאות ופארם',
  'סופר-פארם': 'בריאות ופארם',
  superpharm: 'בריאות ופארם',
  'be ': 'בריאות ופארם',
  'בי ': 'בריאות ופארם',
  פארם: 'בריאות ופארם',
  מכבי: 'בריאות ופארם',
  כללית: 'בריאות ופארם',
  מאוחדת: 'בריאות ופארם',
  לאומית: 'בריאות ופארם',
  מרקחת: 'בריאות ופארם',
  רופא: 'בריאות ופארם',
  רופאה: 'בריאות ופארם',
  שיניים: 'בריאות ופארם',
  אופטיקה: 'בריאות ופארם',
  משקפיים: 'בריאות ופארם',

  // Shopping & Fashion
  זארה: 'קניות ופנאי',
  zara: 'קניות ופנאי',
  קסטרו: 'קניות ופנאי',
  castro: 'קניות ופנאי',
  פוקס: 'קניות ופנאי',
  fox: 'קניות ופנאי',
  'h&m': 'קניות ופנאי',
  'terminal x': 'קניות ופנאי',
  'טרמינל איקס': 'קניות ופנאי',
  shein: 'קניות ופנאי',
  שיין: 'קניות ופנאי',
  asos: 'קניות ופנאי',
  אסוס: 'קניות ופנאי',
  amazon: 'קניות ופנאי',
  אמזון: 'קניות ופנאי',
  aliexpress: 'קניות ופנאי',
  עלי: 'קניות ופנאי',
  ebay: 'קניות ופנאי',
  רנואר: 'קניות ופנאי',
  מנגו: 'קניות ופנאי',
  mango: 'קניות ופנאי',
  אדידס: 'קניות ופנאי',
  נייק: 'קניות ופנאי',
  nike: 'קניות ופנאי',
  נעליים: 'קניות ופנאי',
  ספרים: 'קניות ופנאי',
  סטימצקי: 'קניות ופנאי',
  צומת: 'קניות ופנאי',

  // Insurance & Finances
  הראל: 'ביטוחים ופיננסים',
  מגדל: 'ביטוחים ופיננסים',
  כלל: 'ביטוחים ופיננסים',
  הפניקס: 'ביטוחים ופיננסים',
  מנורה: 'ביטוחים ופיננסים',
  איידיאיי: 'ביטוחים ופיננסים',
  ביטוח: 'ביטוחים ופיננסים',
  ישיר: 'ביטוחים ופיננסים',
  עמלה: 'ביטוחים ופיננסים',
  עמלת: 'ביטוחים ופיננסים',
  ריבית: 'ביטוחים ופיננסים',

  // Salary & Incomes
  משכורת: 'משכורת',
  שכר: 'משכורת',
  'ביטוח לאומי': 'הכנסה נוספת',
  תגמול: 'הכנסה נוספת',
  מענק: 'הכנסה נוספת',
  דיבידנד: 'הכנסה נוספת',
};

// Map credit card sector names ('ענף') to standard categories
const ISRAELI_CARD_BRANCH_MAP: Record<string, string> = {
  מזון: 'סופר ומזון',
  'רשתות מזון': 'סופר ומזון',
  סופרמרקטים: 'סופר ומזון',
  צרכנות: 'סופר ומזון',
  מסעדות: 'מסעדות ובילויים',
  'בתי קפה': 'מסעדות ובילויים',
  מזנון: 'מסעדות ובילויים',
  פאבים: 'מסעדות ובילויים',
  דלק: 'רכב ודלק',
  תחבורה: 'רכב ודלק',
  חניונים: 'רכב ודלק',
  רכב: 'רכב ודלק',
  תקשורת: 'מנויים ותקשורת',
  טלפוניה: 'מנויים ותקשורת',
  אינטרנט: 'מנויים ותקשורת',
  בידור: 'מנויים ותקשורת',
  פארם: 'בריאות ופארם',
  בריאות: 'בריאות ופארם',
  רפואה: 'בריאות ופארם',
  הלבשה: 'קניות ופנאי',
  הנעלה: 'קניות ופנאי',
  חשמל: 'בית ודיור',
  אלקטרוניקה: 'בית ודיור',
  ריהוט: 'בית ודיור',
  דיור: 'בית ודיור',
  עירייה: 'בית ודיור',
  שרותי: 'בית ודיור',
  שונות: 'אחר',
};

/**
 * Normalizes date string into YYYY-MM-DD
 */
export function normalizeDate(raw: any): string | null {
  if (!raw) return null;

  // If XLSX gave us a JS Date object
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    const y = raw.getFullYear();
    const m = String(raw.getMonth() + 1).padStart(2, '0');
    const d = String(raw.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // If XLSX gave us a serial number (e.g. 45892)
  if (typeof raw === 'number') {
    // Excel base date: Dec 30, 1899
    const parsed = new Date((raw - (25567 + 2)) * 86400 * 1000);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  const str = String(raw).trim();

  // Format DD/MM/YYYY or DD/MM/YY
  const slashMatch = str.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
  if (slashMatch) {
    let day = parseInt(slashMatch[1], 10);
    let month = parseInt(slashMatch[2], 10);
    let year = parseInt(slashMatch[3], 10);

    if (year < 100) {
      year += 2000;
    }

    // Sanity check
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Format YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return null;
}

/**
 * Normalizes number from string with commas, currency symbols, parentheses
 */
export function normalizeNumber(raw: any): number {
  if (raw === undefined || raw === null || raw === '') return 0;
  if (typeof raw === 'number') return isNaN(raw) ? 0 : raw;

  const str = String(raw).trim();
  if (!str) return 0;

  // Parentheses indicate negative: (120.50) -> -120.50
  const isParenNeg = /^\(.*\)$/.test(str);

  // Remove currency signs, commas, letters
  const cleaned = str.replace(/[₪$€,\s]/g, '').replace(/[()]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;

  return isParenNeg ? -Math.abs(num) : num;
}

/**
 * Classifies category based on description and branch
 */
export function classifyCategory(description: string, branchName?: string): string {
  if (branchName) {
    const bLower = branchName.trim().toLowerCase();
    for (const [key, cat] of Object.entries(ISRAELI_CARD_BRANCH_MAP)) {
      if (bLower.includes(key.toLowerCase())) {
        return cat;
      }
    }
  }

  const dLower = description.trim().toLowerCase();
  for (const [merchant, cat] of Object.entries(ISRAELI_MERCHANT_CATEGORIES)) {
    if (dLower.includes(merchant.toLowerCase())) {
      return cat;
    }
  }

  return 'אחר';
}

/**
 * Detects if a description indicates salary or income
 */
function isIncomeDescription(desc: string): boolean {
  const d = desc.toLowerCase();
  return (
    d.includes('משכורת') ||
    d.includes('העברה נכנסת') ||
    d.includes('זיכוי') ||
    d.includes('הפקדה') ||
    d.includes('ביטוח לאומי') ||
    d.includes('שכר עבודה') ||
    d.includes('החזר') ||
    d.includes('ריבית זכות')
  );
}

/**
 * Parses a matrix of raw cells (array of arrays) from an Excel or CSV file
 */
export function parseRawTableMatrix(rawRows: any[][]): ParsedBankResult {
  if (!rawRows || rawRows.length === 0) {
    return {
      transactions: [],
      totalDebits: 0,
      totalCredits: 0,
      totalCount: 0,
    };
  }

  // Find header row by checking keywords across the first 20 rows
  let headerRowIndex = -1;
  let dateCol = -1;
  let descCol = -1;
  let debitCol = -1; // חובה
  let creditCol = -1; // זכות
  let amountCol = -1; // סכום / סכום חיוב
  let branchCol = -1; // ענף
  let balanceCol = -1; // יתרה
  let refCol = -1; // אסמכתא

  let detectedBank = 'קובץ בנק';

  // Check top rows for bank name mentions
  for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
    const rowStr = rawRows[r].map((c) => String(c || '')).join(' ');
    if (rowStr.includes('פועלים') || rowStr.includes('Hapoalim')) detectedBank = 'בנק הפועלים';
    else if (rowStr.includes('לאומי') || rowStr.includes('Leumi')) detectedBank = 'בנק לאומי';
    else if (rowStr.includes('דיסקונט') || rowStr.includes('Discount')) detectedBank = 'בנק דיסקונט';
    else if (rowStr.includes('מזרחי') || rowStr.includes('Tefahot')) detectedBank = 'מזרחי טפחות';
    else if (rowStr.includes('יהב')) detectedBank = 'בנק יהב';
    else if (rowStr.includes('ישראכרט') || rowStr.includes('Isracard')) detectedBank = 'ישראכרט';
    else if (rowStr.includes('כאל') || rowStr.includes('Cal')) detectedBank = 'כאל (Cal)';
    else if (rowStr.includes('מקס') || rowStr.includes('Max') || rowStr.includes('לאומי קארד')) detectedBank = 'מקס (Max)';
    else if (rowStr.includes('בינלאומי')) detectedBank = 'הבנק הבינלאומי';
    else if (rowStr.includes('ONE ZERO')) detectedBank = 'ONE ZERO';
  }

  // Locate the header row
  for (let r = 0; r < Math.min(rawRows.length, 25); r++) {
    const row = rawRows[r];
    if (!row || !Array.isArray(row)) continue;

    let foundDate = -1;
    let foundDesc = -1;
    let foundDebit = -1;
    let foundCredit = -1;
    let foundAmount = -1;
    let foundBranch = -1;
    let foundBalance = -1;
    let foundRef = -1;

    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] || '').trim().toLowerCase();
      if (!val) continue;

      if (
        (val.includes('תאריך') || val.includes('date')) &&
        foundDate === -1
      ) {
        foundDate = c;
      } else if (
        (val.includes('תיאור') ||
          val.includes('פעולה') ||
          val.includes('בית עסק') ||
          val.includes('פרטים') ||
          val.includes('מוטב') ||
          val.includes('שם העסק') ||
          val.includes('description')) &&
        foundDesc === -1
      ) {
        foundDesc = c;
      } else if (val === 'חובה' || val.includes('סכום חובה') || val === 'debit') {
        foundDebit = c;
      } else if (val === 'זכות' || val.includes('סכום זכות') || val === 'credit') {
        foundCredit = c;
      } else if (
        (val === 'סכום' ||
          val.includes('סכום חיוב') ||
          val.includes('סכום עסקה') ||
          val.includes('סכום לתשלום') ||
          val.includes('amount')) &&
        foundAmount === -1
      ) {
        foundAmount = c;
      } else if (val.includes('ענף') || val.includes('קטגוריה') || val.includes('סוג')) {
        foundBranch = c;
      } else if (val.includes('יתרה') || val === 'balance') {
        foundBalance = c;
      } else if (val.includes('אסמכתא') || val.includes('שובר') || val.includes('ref')) {
        foundRef = c;
      }
    }

    // Valid header if has date AND (desc OR amount OR (debit/credit))
    if (foundDate !== -1 && (foundDesc !== -1 || foundAmount !== -1 || (foundDebit !== -1 && foundCredit !== -1))) {
      headerRowIndex = r;
      dateCol = foundDate;
      descCol = foundDesc !== -1 ? foundDesc : (foundDate === 0 ? 1 : 0);
      debitCol = foundDebit;
      creditCol = foundCredit;
      amountCol = foundAmount;
      branchCol = foundBranch;
      balanceCol = foundBalance;
      refCol = foundRef;
      break;
    }
  }

  // If no explicit header row was identified, try heuristic column assignment from first data row
  if (headerRowIndex === -1) {
    for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
      const row = rawRows[r];
      if (!row || row.length < 2) continue;
      for (let c = 0; c < row.length; c++) {
        if (normalizeDate(row[c])) {
          headerRowIndex = r - 1; // start from row r
          dateCol = c;
          descCol = c === 0 ? 1 : 0;
          amountCol = c === 0 ? 2 : (c === 1 ? 2 : 1);
          break;
        }
      }
      if (dateCol !== -1) break;
    }
  }

  const startRow = Math.max(0, headerRowIndex + 1);
  const parsedTransactions: ParsedBankResult['transactions'] = [];
  let closingBalance: number | undefined = undefined;
  let totalDebits = 0;
  let totalCredits = 0;

  for (let r = startRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || !Array.isArray(row) || row.length === 0) continue;

    // Extract Date
    const rawDate = dateCol !== -1 ? row[dateCol] : row[0];
    const date = normalizeDate(rawDate);
    if (!date) {
      // Not a transaction row (might be footer, summary, or blank)
      continue;
    }

    // Extract Description
    let desc = '';
    if (descCol !== -1 && row[descCol] !== undefined) {
      desc = String(row[descCol]).trim();
    } else {
      desc = 'תנועה מהבנק';
    }
    if (!desc || desc === '-' || desc === '0') {
      desc = 'תנועה מהבנק';
    }

    // Extract Reference
    let reference = '';
    if (refCol !== -1 && row[refCol] !== undefined) {
      reference = String(row[refCol]).trim();
    }

    // Extract Branch/Category
    let branch = '';
    if (branchCol !== -1 && row[branchCol] !== undefined) {
      branch = String(row[branchCol]).trim();
    }

    // Extract Amounts
    let amount = 0;
    let type: 'expense' | 'income' = 'expense';

    if (debitCol !== -1 || creditCol !== -1) {
      // Bank statement with separate debit and credit columns
      const debitVal = debitCol !== -1 ? normalizeNumber(row[debitCol]) : 0;
      const creditVal = creditCol !== -1 ? normalizeNumber(row[creditCol]) : 0;

      if (debitVal > 0) {
        amount = Math.abs(debitVal);
        type = 'expense';
      } else if (creditVal > 0) {
        amount = Math.abs(creditVal);
        type = 'income';
      } else if (amountCol !== -1) {
        const singleAmt = normalizeNumber(row[amountCol]);
        amount = Math.abs(singleAmt);
        type = singleAmt < 0 ? 'expense' : isIncomeDescription(desc) ? 'income' : 'expense';
      }
    } else if (amountCol !== -1) {
      // Single amount column
      const singleAmt = normalizeNumber(row[amountCol]);
      amount = Math.abs(singleAmt);

      // In credit card exports, positive amounts are purchases/expenses!
      if (detectedBank.includes('ישראכרט') || detectedBank.includes('Cal') || detectedBank.includes('Max')) {
        type = singleAmt < 0 ? 'income' : 'expense'; // negative in credit card statement means credit/refund
      } else {
        type = singleAmt < 0 ? 'expense' : isIncomeDescription(desc) ? 'income' : 'expense';
      }
    } else {
      // Scan other columns for a non-zero number
      for (let c = 0; c < row.length; c++) {
        if (c !== dateCol && c !== descCol) {
          const num = normalizeNumber(row[c]);
          if (num !== 0) {
            amount = Math.abs(num);
            type = num < 0 ? 'expense' : isIncomeDescription(desc) ? 'income' : 'expense';
            break;
          }
        }
      }
    }

    if (amount <= 0) {
      // Ignore zero amount lines
      continue;
    }

    // Extract closing balance if available
    if (balanceCol !== -1 && row[balanceCol] !== undefined) {
      const balNum = normalizeNumber(row[balanceCol]);
      if (balNum !== 0) {
        // Keep the latest balance (topmost row with balance in Israeli reverse chronological statements)
        if (closingBalance === undefined) {
          closingBalance = balNum;
        }
      }
    }

    const category = classifyCategory(desc, branch);

    if (type === 'expense') totalDebits += amount;
    else totalCredits += amount;

    parsedTransactions.push({
      id: `imported-${Date.now()}-${r}-${Math.floor(Math.random() * 1000)}`,
      date,
      description: desc,
      amount: Math.round(amount * 100) / 100,
      type,
      category,
      subCategory: branch || '',
      reference,
      rawRow: row,
    });
  }

  return {
    transactions: parsedTransactions,
    detectedBank,
    closingBalance,
    totalDebits: Math.round(totalDebits * 100) / 100,
    totalCredits: Math.round(totalCredits * 100) / 100,
    totalCount: parsedTransactions.length,
  };
}

/**
 * Parses an Excel file (.xlsx, .xls) from ArrayBuffer
 */
export function parseExcelBuffer(buffer: ArrayBuffer): ParsedBankResult {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { transactions: [], totalDebits: 0, totalCredits: 0, totalCount: 0 };
  }

  const sheet = workbook.Sheets[firstSheetName];
  // header: 1 produces a 2D array of rows
  const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

  return parseRawTableMatrix(rawRows);
}

/**
 * Parses raw text (CSV, TSV, or copy-pasted table)
 */
export function parseTextStatement(text: string): ParsedBankResult {
  if (!text || !text.trim()) {
    return { transactions: [], totalDebits: 0, totalCredits: 0, totalCount: 0 };
  }

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { transactions: [], totalDebits: 0, totalCredits: 0, totalCount: 0 };
  }

  // Detect delimiter: tab (\t), comma (,), semicolon (;)
  const sample = lines.slice(0, 5).join('\n');
  const tabCount = (sample.match(/\t/g) || []).length;
  const semicolonCount = (sample.match(/;/g) || []).length;
  const commaCount = (sample.match(/,/g) || []).length;

  let delimiter = ',';
  if (tabCount > commaCount && tabCount > semicolonCount) delimiter = '\t';
  else if (semicolonCount > commaCount) delimiter = ';';

  const rawRows: string[][] = lines.map((line) => {
    // Basic CSV splitting handling quotes
    if (delimiter === ',') {
      const row: string[] = [];
      let inQuotes = false;
      let cur = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      row.push(cur.trim().replace(/^["']|["']$/g, ''));
      return row;
    } else {
      return line.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    }
  });

  return parseRawTableMatrix(rawRows);
}
