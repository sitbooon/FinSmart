import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Sparkles,
  Info,
  ShieldCheck,
  Check,
  TableProperties,
} from 'lucide-react';
import {
  exportExcelDatabase,
  parseExcelDatabase,
  downloadBlankExcelTemplate,
  ExcelDatabaseData,
  ExcelDatabaseParseResult,
} from '../utils/excelDatabaseEngine';

interface ExcelDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: ExcelDatabaseData;
  onRestoreData: (newData: ExcelDatabaseData) => void;
  isSyncing?: boolean;
  lastSyncedAt?: Date | null;
  onManualSync?: () => Promise<void>;
  onConnectLocalFile?: () => Promise<void>;
  localFileName?: string | null;
}

export const ExcelDatabaseModal: React.FC<ExcelDatabaseModalProps> = ({
  isOpen,
  onClose,
  appData,
  onRestoreData,
  isSyncing = false,
  lastSyncedAt = null,
  onManualSync,
  onConnectLocalFile,
  localFileName = null,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'export' | 'import' | 'guide'>('export');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelDatabaseParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [mergeMode, setMergeMode] = useState<'replace' | 'merge'>('replace');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle Export
  const handleExport = () => {
    try {
      setIsProcessing(true);
      exportExcelDatabase(appData);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: any) {
      console.error('Export error:', err);
      alert('שגיאה ביצירת קובץ האקסל: ' + (err.message || 'שגיאה לא ידועה'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Template download
  const handleDownloadTemplate = () => {
    try {
      downloadBlankExcelTemplate();
    } catch (err: any) {
      console.error('Template error:', err);
    }
  };

  // Handle file select for import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setParseError(null);
    setParseResult(null);

    try {
      const result = await parseExcelDatabase(file);
      if (
        result.stats.transactionsCount === 0 &&
        result.stats.accountsCount === 0 &&
        result.stats.budgetsCount === 0
      ) {
        throw new Error('הקובץ אינו מכיל נתוני תנועות, חשבונות או תקציבים בפורמט המזוהה.');
      }
      setParseResult(result);
    } catch (err: any) {
      console.error('Parse error:', err);
      setParseError(err.message || 'שגיאה בפענוח קובץ האקסל');
    } finally {
      setIsProcessing(false);
      // reset file input value so re-selecting same file triggers change
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Apply parsed data into application
  const handleApplyData = () => {
    if (!parseResult) return;

    try {
      if (mergeMode === 'replace') {
        onRestoreData(parseResult.data);
      } else {
        // Merge mode: keep existing accounts/cards if not in imported, append transactions with deduplication
        const existingTxIds = new Set(appData.transactions.map((t) => t.id));
        const newTransactions = [
          ...appData.transactions,
          ...parseResult.data.transactions.filter((t) => !existingTxIds.has(t.id)),
        ];

        const mergedData: ExcelDatabaseData = {
          accounts: parseResult.data.accounts.length > 0 ? parseResult.data.accounts : appData.accounts,
          creditCards: parseResult.data.creditCards.length > 0 ? parseResult.data.creditCards : appData.creditCards,
          transactions: newTransactions,
          budgets: parseResult.data.budgets.length > 0 ? parseResult.data.budgets : appData.budgets,
          fixedExpenses: parseResult.data.fixedExpenses.length > 0 ? parseResult.data.fixedExpenses : appData.fixedExpenses,
          expectedIncomes: parseResult.data.expectedIncomes.length > 0 ? parseResult.data.expectedIncomes : appData.expectedIncomes,
          savingGoals: parseResult.data.savingGoals.length > 0 ? parseResult.data.savingGoals : appData.savingGoals,
          debts: parseResult.data.debts.length > 0 ? parseResult.data.debts : appData.debts,
          investments: parseResult.data.investments.length > 0 ? parseResult.data.investments : appData.investments,
        };
        onRestoreData(mergedData);
      }

      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        setParseResult(null);
        onClose();
      }, 1800);
    } catch (err: any) {
      alert('שגיאה בטעינת הנתונים: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between bg-[#F8FAF9] dark:bg-[#1A2021]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-base text-[#2D3436] dark:text-white">
                  מסד נתונים מבוסס אקסל (Excel Database)
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  .xlsx Database
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`} />
                  {isSyncing ? 'מסנכרן כעת...' : 'מסונכרן בזמן אמת לכל הדפדפנים'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                כל הנתונים, התנועות והחשבונות שלך מנוהלים כקובץ אקסל שלם ומסונכרנים אוטומטית בין המכשירים
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex border-b border-[#E1E8E7] dark:border-[#2D3636] px-5 gap-2 bg-gray-50/50 dark:bg-[#1C2324] text-xs">
          <button
            onClick={() => setActiveSubTab('export')}
            className={`py-3 px-3.5 font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'export'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>הורדת קובץ אקסל מלא</span>
          </button>

          <button
            onClick={() => setActiveSubTab('import')}
            className={`py-3 px-3.5 font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'import'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>טעינה וסנכרון מאקסל</span>
            {parseResult && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('guide')}
            className={`py-3 px-3.5 font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'guide'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>איך זה עובד? (מדריך קל)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">

          {/* TAB 1: EXPORT */}
          {activeSubTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-850 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>הורדת מסד נתונים מלא בפורמט אקסל (.xlsx)</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  הקובץ מכיל את <strong>כל מבנה הנתונים שלך בלשוניות נפרדות בעברית</strong>: תנועות, חשבונות בנק, כרטיסי אשראי, יעדי תקציב, הוצאות קבועות וחסכונות.
                </p>
              </div>

              {/* Current Database Summary Card */}
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A2021] space-y-3">
                <h4 className="font-bold text-xs text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <TableProperties className="w-4 h-4 text-emerald-600" />
                  <span>תוכן מסד הנתונים הנוכחי שייוצא לקובץ:</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#252D2E] border border-gray-150 dark:border-gray-700 text-center">
                    <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {appData.transactions.length}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">תנועות פיננסיות</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#252D2E] border border-gray-150 dark:border-gray-700 text-center">
                    <div className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                      {appData.accounts.length}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">חשבונות בנק</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#252D2E] border border-gray-150 dark:border-gray-700 text-center">
                    <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {appData.creditCards.length}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">כרטיסי אשראי</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#252D2E] border border-gray-150 dark:border-gray-700 text-center">
                    <div className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                      {appData.budgets.length + appData.fixedExpenses.length}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">תקציבים וקבועות</div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
                  <span>פורמט: Microsoft Excel Workbook (.xlsx)</span>
                  <span>עודכן לאחרונה: היום ({new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })})</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleExport}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {downloadSuccess ? (
                    <>
                      <Check className="w-5 h-5 text-white animate-bounce" />
                      <span>קובץ ה-Database באקסל הורד בהצלחה למחשבך!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>הורד עכשיו את מסד הנתונים המלא באקסל (.xlsx)</span>
                    </>
                  )}
                </button>

                {onConnectLocalFile && (
                  <button
                    onClick={onConnectLocalFile}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800/80 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <span>{localFileName ? `קובץ מקושר פעיל: ${localFileName} (לחץ להחלפה)` : '🔗 חבר לקובץ מקומי במחשב או ב-Google Drive לשמירה אוטומטית ישירה'}</span>
                  </button>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleDownloadTemplate}
                    className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>הורד תבנית אקסל ריקה לדוגמה (Blank Template)</span>
                  </button>
                  <span className="text-[11px] text-gray-400">מותאם לכל גרסאות Excel ו-Google Sheets</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT / SYNC */}
          {activeSubTab === 'import' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-blue-950 dark:text-blue-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-900 dark:text-blue-300">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>טעינת מסד נתונים מאקסל ישירות לאפליקציה</span>
                </div>
                <p className="text-blue-850 dark:text-blue-300 text-[11px] leading-relaxed">
                  העלה את קובץ האקסל המעודכן שלך. האפליקציה תקרא את כל הגיליונות, תבדוק את התקינות שלהם, ותעדכן את המערכת ברגע אחד.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-gray-50/60 dark:bg-[#1A2021] group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-gray-800 dark:text-gray-200">
                  לחץ כאן לבחירת קובץ אקסל או גרור לכאן
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  תומך בקבצי <code className="font-mono">.xlsx</code> או <code className="font-mono">.xls</code> שהורדו מהמערכת או נערכו באקסל
                </div>
              </div>

              {/* Error Message */}
              {parseError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Parse Result Preview */}
              {parseResult && (
                <div className="p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>הקובץ פוענח בהצלחה! להלן הנתונים שנמצאו:</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold">
                      קובץ תקין
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1E2526] border border-emerald-200 dark:border-emerald-800">
                      <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                        {parseResult.stats.transactionsCount}
                      </div>
                      <div className="text-[10px] text-gray-500">תנועות</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1E2526] border border-emerald-200 dark:border-emerald-800">
                      <div className="font-bold text-blue-700 dark:text-blue-400 text-sm">
                        {parseResult.stats.accountsCount}
                      </div>
                      <div className="text-[10px] text-gray-500">חשבונות</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1E2526] border border-emerald-200 dark:border-emerald-800">
                      <div className="font-bold text-indigo-700 dark:text-indigo-400 text-sm">
                        {parseResult.stats.creditCardsCount}
                      </div>
                      <div className="text-[10px] text-gray-500">כרטיסי אשראי</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#1E2526] border border-emerald-200 dark:border-emerald-800">
                      <div className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                        {parseResult.stats.budgetsCount + parseResult.stats.fixedExpensesCount}
                      </div>
                      <div className="text-[10px] text-gray-500">תקציבים וקבועות</div>
                    </div>
                  </div>

                  {/* Mode selection: Replace vs Merge */}
                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 space-y-2">
                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      כיצד לייבא את הנתונים?
                    </div>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={mergeMode === 'replace'}
                          onChange={() => setMergeMode('replace')}
                          className="accent-emerald-600"
                        />
                        <span><strong>החלף הכל</strong> בנתוני האקסל (מומלץ)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="importMode"
                          value="merge"
                          checked={mergeMode === 'merge'}
                          onChange={() => setMergeMode('merge')}
                          className="accent-emerald-600"
                        />
                        <span><strong>מזג</strong> עם הנתונים הקיימים</span>
                      </label>
                    </div>
                  </div>

                  {/* Confirm Apply Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleApplyData}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      {importSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>הנתונים נטענו בהצלחה למערכת!</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>טען את נתוני האקסל לאפליקציה עכשיו</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GUIDE */}
          {activeSubTab === 'guide' && (
            <div className="space-y-4 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>שיטת העבודה: קובץ אקסל כ-Database עצמאי</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 text-xs">
                  זהו פתרון מושלם למי שרוצה <strong>100% עצמאות</strong>, בלי להירשם לאף שירות צד-שלישי, בלי התחברויות وبלי שגיאות הרשאה.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 items-start p-3 rounded-xl bg-gray-50 dark:bg-[#1A2021] border border-gray-200 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">איפה שומרים את הקובץ?</h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      שמור את הקובץ ב-<strong>Google Drive</strong>, <strong>OneDrive</strong>, <strong>iCloud</strong>, או פשוט שלח אותו בוואטסאפ לאשתך. כל גרסה שלו היא גיבוי שלם של כל התקציב שלכם.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 rounded-xl bg-gray-50 dark:bg-[#1A2021] border border-gray-200 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">איך מזינים תנועות?</h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      אפשר להזין כרגיל באפליקציה (כפתור "הוסף תנועה"), או לפתוח את קובץ האקסל ב-Microsoft Excel / Google Sheets ולהוסיף שורות בגיליון "תנועות_פיננסיות".
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 rounded-xl bg-gray-50 dark:bg-[#1A2021] border border-gray-200 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">איך פותחים במכשיר אחר?</h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      בטלפון או במחשב הנוסף נכנסים לאפליקציה ב-Vercel, לוחצים על <strong>"מסד נתונים Excel"</strong> ⟵ ובוחרים את הקובץ. האפליקציה תטען מיד את כל המידע!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between bg-gray-50/50 dark:bg-[#1A2021]">
          <div className="text-[11px] text-gray-400">
            {appData.transactions.length} תנועות רשומות בזיכרון
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold text-xs transition-colors"
            >
              סגור
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
