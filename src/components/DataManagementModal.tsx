import React, { useRef, useState } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  Trash2,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  FileJson,
  Laptop,
  Check,
  Globe,
  Copy,
  FileSpreadsheet,
} from 'lucide-react';
import {
  exportExcelDatabase,
  parseExcelDatabase,
  ExcelDatabaseData,
} from '../utils/excelDatabaseEngine';
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
} from '../types';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDemoMode: boolean;
  onLoadCleanState: () => void;
  onLoadDemoState: () => void;
  // Full state package for backup
  appData: {
    accounts: Account[];
    creditCards: CreditCard[];
    transactions: Transaction[];
    fixedExpenses: FixedExpense[];
    expectedIncomes: ExpectedIncome[];
    categories: Category[];
    budgets: Budget[];
    savingGoals: SavingGoal[];
    debts: Debt[];
    investments: Investment[];
    merchantRules: Record<string, string>;
  };
  onRestoreBackup: (restoredData: any) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  isDemoMode,
  onLoadCleanState,
  onLoadDemoState,
  appData,
  onRestoreBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const excelFileInputRef = useRef<HTMLInputElement | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [excelExportNotification, setExcelExportNotification] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export full app data to Excel database (.xlsx)
  const handleExportExcel = () => {
    try {
      exportExcelDatabase(appData);
      setExcelExportNotification(true);
      setTimeout(() => setExcelExportNotification(false), 3000);
    } catch (err: any) {
      alert('שגיאה ביצירת קובץ אקסל: ' + err.message);
    }
  };

  // Import full app data from Excel database (.xlsx)
  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImportStatus('מפענח קובץ אקסל...');
      const result = await parseExcelDatabase(file);
      onRestoreBackup(result.data);
      setImportStatus(`הנתונים מאקסל שוחזרו בהצלחה! (${result.stats.transactionsCount} תנועות, ${result.stats.accountsCount} חשבונות)`);
      setTimeout(() => setImportStatus(null), 5000);
    } catch (err: any) {
      setImportStatus('שגיאה בטעינת קובץ האקסל: ' + (err.message || 'שגיאה לא ידועה'));
    } finally {
      if (excelFileInputRef.current) excelFileInputRef.current.value = '';
    }
  };

  // Export full app data to a downloadable JSON file
  const handleExportJson = () => {
    const backupObject = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      source: 'FinSmart Financial OS',
      data: appData,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObject, null, 2));
    const downloadAnchor = document.createElement('a');
    const todayStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `finsmart_backup_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const dataToRestore = parsed.data || parsed;

        if (!dataToRestore.accounts && !dataToRestore.transactions) {
          throw new Error('קובץ הגיבוי אינו בפורמט תקין');
        }

        onRestoreBackup(dataToRestore);
        setImportStatus('השחזור הושלם בהצלחה! כל הנתונים נטענו.');
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1800);
      } catch (err: any) {
        setImportStatus(`שגיאה בקריאת הקובץ: ${err.message || 'פורמט לא נתמך'}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF7F5] dark:bg-[#00B894]/20 flex items-center justify-center text-[#00B894]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#2D3436] dark:text-white">
                ניהול נתונים, שמירה וגיבוי
              </h2>
              <p className="text-[11px] text-gray-400">
                מעבר בין גרסה נקייה לדמו, ואבטחת נתונים מפני מחיקה
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Explanation Banner: How is data saved? */}
          <div className="bg-[#EBF7F5] dark:bg-[#00B894]/10 border border-[#00B894]/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#00B894] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>איך המערכת שומרת שהמידע שלך לא יימחק לעולם?</span>
            </div>
            <div className="text-[11px] text-gray-700 dark:text-gray-300 space-y-1.5 leading-relaxed">
              <p>
                <strong>1. שמירה מקומית אוטומטית בזמן אמת (LocalStorage):</strong> כל תנועה, יתרה, תקציב או כרטיס שאתה מזין נשמרים ישירות בזיכרון המקומי המאובטח של הדפדפן במכשירך. המידע אינו נמחק בריענון עמוד או סגירת הדפדפן.
              </p>
              <p>
                <strong>2. פרטיות מקסימלית:</strong> הנתונים הפיננסיים שלך נשמרים אצלך בלבד ולא מועברים לשרתים זרים.
              </p>
              <p>
                <strong>3. גיבוי לקובץ (100% הגנה):</strong> כדי להבטיח שהמידע יישמר גם אם תנקה את היסטוריית הדפדפן או תרצה להעבירו למחשב אחר, ניתן להוריד קובץ גיבוי מלא בלחיצה אחת.
              </p>
            </div>
          </div>

          {/* Mode Switcher: Clean vs Demo */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-[#2D3436] dark:text-white flex items-center gap-1.5">
              <span>בחר מצב עבודה:</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isDemoMode
                    ? 'bg-[#FFF9EB] text-[#D6A317] dark:bg-amber-950/40'
                    : 'bg-[#EBF7F5] text-[#00B894] dark:bg-[#00B894]/20'
                }`}
              >
                {isDemoMode ? 'כרגע מוצגים נתוני הדגמה (דמו)' : 'כרגע במצב גרסה נקייה אישית'}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Clean Version Option */}
              <div
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  !isDemoMode
                    ? 'border-[#00B894] bg-[#F4F7F6]/60 dark:bg-[#191D1E]'
                    : 'border-[#E1E8E7] dark:border-[#2D3636] hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#2D3436] dark:text-white">
                      גרסה נקייה מתוכן (לשימוש אמיתי)
                    </span>
                    {!isDemoMode && <CheckCircle2 className="w-4 h-4 text-[#00B894]" />}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    מאפסת את כל הנתונים הפיקטיביים. כוללת את כל קטגוריות התקציב הישראליות מוכנות להזנת העו"ש, כרטיסי האשראי והתנועות שלך.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('האם לעבור לגרסה נקייה מתוכן? (הנתונים הפיקטיביים יוסרו)')) {
                      onLoadCleanState();
                    }
                  }}
                  className="mt-3 w-full py-2 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>הפעל גרסה נקייה (רוקן תוכן)</span>
                </button>
              </div>

              {/* Demo Version Option */}
              <div
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isDemoMode
                    ? 'border-[#D6A317] bg-[#FFF9EB]/40 dark:bg-amber-950/20'
                    : 'border-[#E1E8E7] dark:border-[#2D3636] hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#2D3436] dark:text-white">
                      גרסת הדגמה עשירה (דמו)
                    </span>
                    {isDemoMode && <CheckCircle2 className="w-4 h-4 text-[#D6A317]" />}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    טוענת נתונים ישראליים עשירים (עו״ש, 3 כרטיסי אשראי, תנועות, פנסיה וחיסכון) להתרשמות מלאה מכל מסכי המערכת והסימולטור.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('האם לטעון את נתוני הדוגמה המלאים לצורך התרשמות?')) {
                      onLoadDemoState();
                    }
                  }}
                  className="mt-3 w-full py-2 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] hover:bg-[#E1E8E7] dark:hover:bg-[#2D3636] text-[#2D3436] dark:text-white font-bold text-xs border border-[#E1E8E7] dark:border-[#2D3636] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FDCB6E]" />
                  <span>טען נתוני דוגמה להתרשמות</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup & Restore Section */}
          <div className="pt-3 border-t border-[#E1E8E7] dark:border-[#2D3636] space-y-4">
            <div>
              <h3 className="font-bold text-xs text-[#2D3436] dark:text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>מסד נתונים באקסל (Excel Database - מומלץ)</span>
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                קובץ אקסל מלא עם כל הנתונים, התנועות והחשבונות בלשוניות נפרדות. ניתן לערוך ב-Excel או לשמור ב-Google Drive.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {/* Excel Export Button */}
              <button
                type="button"
                onClick={handleExportExcel}
                className="flex-1 min-w-[220px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-850 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800/80 shadow-xs transition-colors"
              >
                {excelExportNotification ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 animate-bounce" />
                    <span>קובץ ה-Excel הורד בהצלחה!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>הורד מסד נתונים מלא (Excel .xlsx)</span>
                  </>
                )}
              </button>

              {/* Excel Import Button */}
              <button
                type="button"
                onClick={() => excelFileInputRef.current?.click()}
                className="flex-1 min-w-[220px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#191D1E] hover:bg-[#F4F7F6] dark:hover:bg-[#252D2E] text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800 shadow-xs transition-colors"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>טען וסנכרן מקובץ אקסל (.xlsx)</span>
              </button>

              <input
                ref={excelFileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleExcelFileChange}
              />
            </div>

            <div className="pt-2">
              <h4 className="font-semibold text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2">
                <FileJson className="w-3.5 h-3.5 text-gray-400" />
                <span>גיבוי טכני נוסף (JSON):</span>
              </h4>

              <div className="flex flex-wrap gap-2.5">
                {/* JSON Export Button */}
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#191D1E] hover:bg-gray-100 dark:hover:bg-[#252D2E] text-gray-700 dark:text-gray-300 font-semibold text-[11px] border border-gray-200 dark:border-gray-700 shadow-2xs transition-colors"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00B894]" />
                      <span className="text-[#00B894]">הורד (JSON)</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-gray-500" />
                      <span>גיבוי JSON מלא</span>
                    </>
                  )}
                </button>

                {/* JSON Import Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#191D1E] hover:bg-gray-100 dark:hover:bg-[#252D2E] text-gray-700 dark:text-gray-300 font-semibold text-[11px] border border-gray-200 dark:border-gray-700 shadow-2xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-500" />
                  <span>שחזור מקובץ JSON</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {importStatus && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  importStatus.includes('בהצלחה')
                    ? 'bg-[#EBF7F5] text-[#00B894] border border-[#00B894]/30'
                    : 'bg-rose-50 text-[#FF7675] border border-[#FF7675]/30'
                }`}
              >
                {importStatus.includes('בהצלחה') ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{importStatus}</span>
              </div>
            )}
          </div>

          {/* Vercel Deployment Section */}
          <div className="pt-3 border-t border-[#E1E8E7] dark:border-[#2D3636] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-[#2D3436] dark:text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>מוכן להעלאה ל-Vercel (פריסה בענן)</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                100% Vercel Ready ✓
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F4F7F6]/80 dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636] text-[11px] text-gray-600 dark:text-gray-300 space-y-2">
              <p className="leading-relaxed">
                הפרויקט הוגדר ומותאם באופן מלא לפריסה ב-<strong>Vercel</strong> באמצעות <code className="bg-white dark:bg-[#252D2E] px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-mono text-[10px]">vercel.json</code> ופונקציית Serverless ב-<code className="bg-white dark:bg-[#252D2E] px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-mono text-[10px]">api/index.ts</code>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="p-2 rounded-lg bg-white dark:bg-[#202728] border border-gray-200 dark:border-gray-700/60">
                  <div className="font-bold text-[#2D3436] dark:text-white mb-0.5">1. חיבור ל-Git</div>
                  <div className="text-[10px] text-gray-400">העלה את הפרויקט ל-GitHub ולחץ Import ב-Vercel</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-[#202728] border border-gray-200 dark:border-gray-700/60">
                  <div className="font-bold text-[#2D3436] dark:text-white mb-0.5">2. הגדרת משתנה</div>
                  <div className="text-[10px] text-gray-400">הזן GEMINI_API_KEY תחת Environment Variables</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-[#202728] border border-gray-200 dark:border-gray-700/60">
                  <div className="font-bold text-[#2D3436] dark:text-white mb-0.5">3. פריסה בלחיצה</div>
                  <div className="text-[10px] text-gray-400">לחץ Deploy וקבל קישור https פעיל ומאובטח</div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic pt-1">
                מדריך מפורט מלא שמור בקובץ <code className="font-mono font-bold">VERCEL.md</code> בשורש הפרויקט.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#E1E8E7] dark:border-[#2D3636] flex justify-end bg-[#F4F7F6]/50 dark:bg-[#191D1E]/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white font-bold text-xs transition-colors shadow-xs"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
