import express from "express";
import fs from "fs";
import path from "path";
import * as XLSXModule from "xlsx";
const XLSX: any = (XLSXModule as any).default || XLSXModule;
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { parseTextStatement } from "../utils/bankStatementParser";
import { buildExcelDatabaseWorkbook, parseExcelWorkbook } from "../utils/excelDatabaseEngine";

dotenv.config();

export const app = express();

app.use(express.json({ limit: "10mb" }));

// Lazy Gemini AI initialization with server-side API key
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY,
    environment: process.env.VERCEL ? "vercel-serverless" : "container",
  });
});

// AI Financial Chat Assistant endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, financialContext, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "נא לספק הודעה תקינה" });
    }

    const ai = getGeminiClient();

    // Context description in Hebrew
    const contextPrompt = financialContext
      ? `
נתונים פיננסיים עדכניים של המשתמש:
- יתרה נוכחית בעו"ש: ₪${financialContext.currentBalance?.toLocaleString() || 0}
- כסף פנוי אמיתי עד סוף החודש: ₪${financialContext.realAvailableMoney?.toLocaleString() || 0}
- הכנסות החודש בפועל: ₪${financialContext.monthIncome?.toLocaleString() || 0}
- הוצאות החודש בפועל: ₪${financialContext.monthExpense?.toLocaleString() || 0}
- הוצאות קבועות צפויות עד סוף החודש: ₪${financialContext.pendingFixedExpenses?.toLocaleString() || 0}
- חיוב אשראי צפוי במועד הקרוב: ₪${financialContext.upcomingCreditCardBills?.toLocaleString() || 0}
- תחזית יתרה לסוף החודש: ₪${financialContext.projectedEndOfMonthBalance?.toLocaleString() || 0}
- תקציב יומי מומלץ למשך שאר החודש: ₪${financialContext.dailyRecommendedBudget?.toLocaleString() || 0}
- מצב החודש: ${financialContext.monthStatus || "טוב"}
- סך חובות (הלוואות ומשכנתא): ₪${financialContext.totalDebts?.toLocaleString() || 0}
- סך חסכונות והשקעות: ₪${financialContext.totalSavings?.toLocaleString() || 0}
- קטגוריות עם הוצאות בולטות: ${financialContext.topCategories || "מזון, סופר, דיור, רכב"}
- חריגות או התראות אחרונות: ${financialContext.recentAlerts || "אין חריגות קריטיות"}
`
      : "";

    const systemInstruction = `
אתה יועץ פיננסי אישי ומשפחתי מומחה, חכם, אמפתי ופרקטי באפליקציית "FinOS - ניהול פיננסי חכם".
אתה עונה אך ורק בעברית קולחת, בהירה, מדויקת ומעודדת (בסגנון RiseUp אבל מקצועי וישיר).
עקרונות חובה:
1. התבסס בדיוק על המספרים והנתונים שסופקו לך בנתוני המשתמש. אל תמציא מספרים או עובדות.
2. תן תשובה ממוקדת שעונה ישירות על שאלת המשתמש (למשל: "כמה כסף באמת פנוי לי?", "האם אני יכול להרשות לעצמי קנייה ב-X?", "איפה אני מבזבז הכי הרבה?").
3. תמיד ענה על השאלות הקרדינליות: כמה פנוי, מה התחזית לסוף החודש, ומה הצעד הפרקטי המומלץ כעת.
4. השתמש בסימון ש"ח (₪) ועצב פסקאות קצרות, נקודות תבליט (bullets) במידת הצורך, בצורה קריאה ונעימה לעין.
${contextPrompt}
`;

    if (!ai) {
      // Graceful rule-based intelligent fallback if API key is not yet set
      const userLower = message.toLowerCase();
      let fallbackAnswer = "";

      if (userLower.includes("פנוי") || userLower.includes("כמה כסף")) {
        fallbackAnswer = `על פי החישוב המעודכן שלנו, **הכסף הפנוי האמיתי** שלך לחודש זה עומד על כ-**₪${financialContext?.realAvailableMoney?.toLocaleString() || "0"}**.\n\nסכום זה מחושב לאחר שקלול כל החיובים העתידיים בכרטיסי האשראי וההוצאות הקבועות (משכנתא/שכירות ומנויים) שנותרו עד סוף החודש.`;
      } else if (userLower.includes("להרשות") || userLower.includes("לקנות") || userLower.includes("קנייה")) {
        const amtMatch = message.match(/\d+([,.]\d+)?/);
        const amt = amtMatch ? parseFloat(amtMatch[0].replace(/,/g, "")) : 2000;
        const available = financialContext?.realAvailableMoney || 0;
        if (available > 0 && amt <= available * 0.4) {
          fallbackAnswer = `כן, מבחינת התזרים הנוכחי אתה בהחלט יכול להרשות לעצמך הוצאה של ₪${amt.toLocaleString()}.\nיישאר לך מרווח ביטחון של כ-₪${(available - amt).toLocaleString()} בכסף הפנוי האמיתי.`;
        } else if (available > 0 && amt <= available) {
          fallbackAnswer = `הרכישה בסך ₪${amt.toLocaleString()} אפשרית, אך תנצל חלק ניכר (כ-${Math.round((amt / available) * 100)}%) מהכסף הפנוי שלך לסוף החודש.\nהמלצה: שקול לחלק ל-2-3 תשלומים ללא ריבית או לדחות לחודש הבא.`;
        } else {
          fallbackAnswer = `זהירות: הוצאה של ₪${amt.toLocaleString()} גדולה מהכסף הפנוי האמיתי שלך כרגע (₪${available.toLocaleString()}).\nרכישה כזו עלולה להכניס את החשבון לגירעון עד סוף החודש. מומלץ להמתין לכניסת המשכורת הבאה או להשתמש בקרן ייעודית.`;
        }
      } else if (userLower.includes("אוכל") || userLower.includes("סופר") || userLower.includes("מסעדות")) {
        fallbackAnswer = `לפי נתוני התנועות שלך, מומלץ לשמור על תקציב שבועי מוגדר לסופר ומסעדות.\nטיפ: כדאי להגדיר תקרת תקציב בלשונית "תקציבים" כדי לקבל התראות לפני חריגה.`;
      } else if (userLower.includes("סוף החודש") || userLower.includes("תחזית")) {
        fallbackAnswer = `תחזית סוף החודש שלך צפויה להסתיים ב**יתרה של ₪${financialContext?.projectedEndOfMonthBalance?.toLocaleString() || "0"}**.\nהתקציב היומי המומלץ שלך עומד על כ-₪${financialContext?.dailyRecommendedBudget?.toLocaleString() || "0"} ליום.`;
      } else {
        fallbackAnswer = `שלום! אני העוזר הפיננסי החכם שלך ב-FinOS.\nנכון לעכשיו:\n• **כסף פנוי אמיתי:** ₪${financialContext?.realAvailableMoney?.toLocaleString() || "0"}\n• **תחזית סוף חודש:** ₪${financialContext?.projectedEndOfMonthBalance?.toLocaleString() || "0"}\n• **תקציב מומלץ ליום:** ₪${financialContext?.dailyRecommendedBudget?.toLocaleString() || "0"}\n\nתוכל לשאול אותי כל שאלה כמו: "האם כדאי לי לקנות מוצר ב-1,500 ₪?", "כמה הוצאתי על דלק?", או "איך החודש מסתיים?".`;
      }

      return res.json({ reply: fallbackAnswer, mode: "smart-engine" });
    }

    // Build message contents for Gemini
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        contents.push({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "לא התקבלה תשובה מהמודל. נסה שנית.";
    return res.json({ reply, mode: "gemini" });
  } catch (error: any) {
    console.error("Gemini chat error:", error);
    return res.status(500).json({
      error: "שגיאה בתקשורת עם שירות ה-AI",
      details: error.message || String(error),
    });
  }
});

// AI Insights endpoint
app.post("/api/ai/insights", async (req, res) => {
  try {
    const { financialContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        insights: [
          {
            id: "ins-1",
            title: "תחזית חודשית",
            text: "החודש צפוי להסתיים ביתרה של ₪" + (financialContext?.projectedEndOfMonthBalance?.toLocaleString() || "0") + ".",
            category: "תזרים",
            badge: "תזרים",
            type: "success",
          },
          {
            id: "ins-2",
            title: "ניהול תקציב יומי",
            text: "מומלץ לשמור על מסגרת הוצאות של עד ₪" + (financialContext?.dailyRecommendedBudget?.toLocaleString() || "150") + " ליום.",
            category: "בקרה",
            badge: "המלצה",
            type: "info",
          },
        ],
      });
    }

    const prompt = `
נתח את הנתונים הפיננסיים הבאים וייצר 4 תובנות קצרות, מדויקות ופרקטיות בעברית.
הנתונים:
${JSON.stringify(financialContext, null, 2)}

החזר בפורמט JSON בלבד כמערך של אובייקטים:
[
  {
    "id": "string",
    "title": "כותרת תובנה קצרה",
    "text": "פירוט התובנה בשורה-שתיים, עם מספרים ספציפיים והמלצה",
    "category": "תזרים/מזון/חיסכון/אשראי/התייעלות",
    "badge": "מצוין/תשומת לב/המלצה",
    "type": "success/warning/info"
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({ insights: parsed });
  } catch (error) {
    console.error("AI Insights error:", error);
    return res.status(500).json({ error: "נכשלה הפקת תובנות" });
  }
});

// Shared CSV parsing helper using the robust bank statement parser
function parseCsvContent(csvText: string) {
  const result = parseTextStatement(csvText);
  return result.transactions;
}

// CSV Transaction Parsing API endpoint (supports both /api/import/csv and /api/csv/parse)
app.post("/api/import/csv", (req, res) => {
  try {
    const { csvText, csvContent } = req.body;
    const text = csvText || csvContent;
    if (!text) {
      return res.status(400).json({ error: "לא נמסר תוכן CSV" });
    }
    const transactions = parseCsvContent(text);
    res.json({ count: transactions.length, transactions, records: transactions });
  } catch (err: any) {
    res.status(500).json({ error: "שגיאה בניתוח קובץ CSV", details: err.message });
  }
});

app.post("/api/csv/parse", (req, res) => {
  try {
    const { csvText, csvContent } = req.body;
    const text = csvText || csvContent;
    if (!text) {
      return res.status(400).json({ error: "לא נמסר תוכן CSV" });
    }
    const transactions = parseCsvContent(text);
    res.json({ count: transactions.length, records: transactions, transactions });
  } catch (err: any) {
    res.status(500).json({ error: "שגיאה בניתוח קובץ CSV", details: err.message });
  }
});

// Excel Database Persistence Engine (Server-side storage)
const DATA_DIR = path.join(process.cwd(), "data");
const DB_JSON_FILE = path.join(DATA_DIR, "finos_database.json");
const DB_EXCEL_FILE = path.join(DATA_DIR, "finos_database.xlsx");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.warn("Could not create data dir:", e);
    }
  }
}

/**
 * Safely reads an Excel workbook from file path using buffer or readFile
 */
function readWorkbookFromFile(filePath: string): any {
  if (typeof XLSX.readFile === "function") {
    try {
      return XLSX.readFile(filePath);
    } catch (e) {
      // fallback to buffer read
    }
  }
  const buffer = fs.readFileSync(filePath);
  return XLSX.read(buffer, { type: "buffer" });
}

/**
 * Safely writes an Excel workbook to disk using buffer or writeFile
 */
function writeWorkbookToFile(wb: any, filePath: string): void {
  if (typeof XLSX.writeFile === "function") {
    try {
      XLSX.writeFile(wb, filePath);
      return;
    } catch (e) {
      // fallback to buffer write
    }
  }
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  fs.writeFileSync(filePath, buffer);
}

/**
 * Reads and parses database directly from the server's Excel file (finos_database.xlsx)
 */
function readExcelDatabaseFromDisk(): { data: any; stats: any; fileInfo: any; updatedAt: string } | null {
  ensureDataDir();

  // 1. First priority: Read directly from server Excel file
  if (fs.existsSync(DB_EXCEL_FILE)) {
    try {
      const stats = fs.statSync(DB_EXCEL_FILE);
      if (stats.size > 0) {
        const workbook = readWorkbookFromFile(DB_EXCEL_FILE);
        const parseResult = parseExcelWorkbook(workbook, "finos_database.xlsx");
        return {
          data: parseResult.data,
          stats: parseResult.stats,
          fileInfo: {
            name: "finos_database.xlsx",
            path: "data/finos_database.xlsx",
            absolutePath: path.resolve(DB_EXCEL_FILE),
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
            sheetNames: workbook.SheetNames,
          },
          updatedAt: stats.mtime.toISOString(),
        };
      }
    } catch (readErr) {
      console.error("Error parsing Excel file from disk:", readErr);
    }
  }

  // 2. Fallback: If Excel does not exist yet or was zero bytes, load from JSON and write Excel
  if (fs.existsSync(DB_JSON_FILE)) {
    try {
      const raw = fs.readFileSync(DB_JSON_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      const data = parsed.data || parsed;
      try {
        const wb = buildExcelDatabaseWorkbook(data);
        writeWorkbookToFile(wb, DB_EXCEL_FILE);
        const stats = fs.statSync(DB_EXCEL_FILE);
        return {
          data,
          stats: {
            transactionsCount: data.transactions?.length || 0,
            accountsCount: data.accounts?.length || 0,
            creditCardsCount: data.creditCards?.length || 0,
          },
          fileInfo: {
            name: "finos_database.xlsx",
            path: "data/finos_database.xlsx",
            absolutePath: path.resolve(DB_EXCEL_FILE),
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
            sheetNames: wb.SheetNames,
          },
          updatedAt: stats.mtime.toISOString(),
        };
      } catch (wbErr) {
        console.warn("Could not generate Excel workbook:", wbErr);
      }
    } catch (jsonErr) {
      console.error("Error reading JSON file from disk:", jsonErr);
    }
  }

  return null;
}

// Get saved master database state extracted directly from server Excel file
app.get("/api/database/state", (_req, res) => {
  try {
    const db = readExcelDatabaseFromDisk();
    if (db) {
      return res.json({
        exists: true,
        data: db.data,
        stats: db.stats,
        fileInfo: db.fileInfo,
        updatedAt: db.updatedAt,
        source: "server_excel_file",
      });
    }
    return res.json({ exists: false });
  } catch (err: any) {
    console.error("Error reading database state:", err);
    return res.status(500).json({ error: "שגיאה בקריאת מסד הנתונים מקובץ האקסל בשרת" });
  }
});

// Save complete database state directly into server's Excel file
app.post("/api/database/state", (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "נתונים לא סופקו" });
    }

    ensureDataDir();
    const nowIso = new Date().toISOString();
    const payload = {
      data,
      updatedAt: nowIso,
    };

    // 1. Write Excel file directly
    const workbook = buildExcelDatabaseWorkbook(data);
    writeWorkbookToFile(workbook, DB_EXCEL_FILE);

    // 2. Write JSON backup
    fs.writeFileSync(DB_JSON_FILE, JSON.stringify(payload, null, 2), "utf-8");

    const stats = fs.statSync(DB_EXCEL_FILE);

    return res.json({
      success: true,
      updatedAt: stats.mtime.toISOString(),
      fileInfo: {
        name: "finos_database.xlsx",
        path: "data/finos_database.xlsx",
        absolutePath: path.resolve(DB_EXCEL_FILE),
        size: stats.size,
        sheetNames: workbook.SheetNames,
      },
      stats: {
        transactions: data.transactions?.length || 0,
        accounts: data.accounts?.length || 0,
        cards: data.creditCards?.length || 0,
      },
    });
  } catch (err: any) {
    console.error("Error saving database state to Excel:", err);
    return res.status(500).json({ error: "שגיאה בשמירת מסד הנתונים לקובץ אקסל", details: err.message });
  }
});

// Append or update a single transaction immediately into server Excel file
app.post("/api/database/transaction", (req, res) => {
  try {
    const { transaction } = req.body;
    if (!transaction || !transaction.id) {
      return res.status(400).json({ error: "נתוני תנועה חסרים" });
    }

    ensureDataDir();
    const current = readExcelDatabaseFromDisk();
    const currentData = current?.data || {
      accounts: [],
      creditCards: [],
      transactions: [],
      fixedExpenses: [],
      expectedIncomes: [],
      budgets: [],
      savingGoals: [],
      debts: [],
      investments: [],
    };

    if (!Array.isArray(currentData.transactions)) {
      currentData.transactions = [];
    }

    const existingIdx = currentData.transactions.findIndex((t: any) => t.id === transaction.id);
    if (existingIdx >= 0) {
      currentData.transactions[existingIdx] = transaction;
    } else {
      currentData.transactions.unshift(transaction);
    }

    // Write updated workbook to disk immediately
    const workbook = buildExcelDatabaseWorkbook(currentData);
    writeWorkbookToFile(workbook, DB_EXCEL_FILE);

    // Save JSON backup
    fs.writeFileSync(
      DB_JSON_FILE,
      JSON.stringify({ data: currentData, updatedAt: new Date().toISOString() }, null, 2),
      "utf-8"
    );

    const stats = fs.statSync(DB_EXCEL_FILE);

    return res.json({
      success: true,
      transaction,
      totalTransactions: currentData.transactions.length,
      updatedAt: stats.mtime.toISOString(),
      fileInfo: {
        name: "finos_database.xlsx",
        path: "data/finos_database.xlsx",
        size: stats.size,
      },
    });
  } catch (err: any) {
    console.error("Error saving single transaction to Excel:", err);
    return res.status(500).json({ error: "שגיאה ברישום התנועה בקובץ האקסל בשרת", details: err.message });
  }
});

// Delete a transaction from server Excel file
app.post("/api/database/delete-transaction", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "מזהה תנועה חסר" });
    }

    ensureDataDir();
    const current = readExcelDatabaseFromDisk();
    if (!current?.data || !Array.isArray(current.data.transactions)) {
      return res.status(404).json({ error: "לא נמצאו תנועות במסד הנתונים" });
    }

    const currentData = current.data;
    const initialLen = currentData.transactions.length;
    currentData.transactions = currentData.transactions.filter((t: any) => t.id !== id);

    if (currentData.transactions.length !== initialLen) {
      const workbook = buildExcelDatabaseWorkbook(currentData);
      writeWorkbookToFile(workbook, DB_EXCEL_FILE);
      fs.writeFileSync(
        DB_JSON_FILE,
        JSON.stringify({ data: currentData, updatedAt: new Date().toISOString() }, null, 2),
        "utf-8"
      );
    }

    const stats = fs.existsSync(DB_EXCEL_FILE) ? fs.statSync(DB_EXCEL_FILE) : null;

    return res.json({
      success: true,
      deletedId: id,
      totalTransactions: currentData.transactions.length,
      updatedAt: stats ? stats.mtime.toISOString() : new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Error deleting transaction from Excel:", err);
    return res.status(500).json({ error: "שגיאה במחיקת התנועה מקובץ האקסל בשרת", details: err.message });
  }
});

// Download latest Excel database file directly
app.get("/api/database/download", (_req, res) => {
  try {
    ensureDataDir();
    if (fs.existsSync(DB_EXCEL_FILE)) {
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="finos_database_${new Date().toISOString().slice(0, 10)}.xlsx"`);
      return res.sendFile(DB_EXCEL_FILE);
    }

    // If Excel doesn't exist yet but JSON exists, generate it
    if (fs.existsSync(DB_JSON_FILE)) {
      const raw = fs.readFileSync(DB_JSON_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      const workbook = buildExcelDatabaseWorkbook(parsed.data || parsed);
      writeWorkbookToFile(workbook, DB_EXCEL_FILE);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="finos_database_${new Date().toISOString().slice(0, 10)}.xlsx"`);
      return res.sendFile(DB_EXCEL_FILE);
    }

    return res.status(404).json({ error: "טרם נשמר קובץ אקסל בשרת" });
  } catch (err: any) {
    console.error("Error downloading database:", err);
    return res.status(500).json({ error: "שגיאה בהורדת קובץ אקסל" });
  }
});

export default app;
