import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
  Check,
  CreditCard as CardIcon,
  Building2,
  Trash2,
  Filter,
} from 'lucide-react';
import { Transaction, Account, CreditCard } from '../types';
import {
  parseExcelBuffer,
  parseTextStatement,
  ParsedBankResult,
} from '../utils/bankStatementParser';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Transaction[], newCheckingBalance?: number) => void;
  existingTransactions: Transaction[];
  accounts?: Account[];
  creditCards?: CreditCard[];
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingTransactions,
  accounts = [],
  creditCards = [],
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'guide'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parsed result
  const [parsedData, setParsedData] = useState<ParsedBankResult | null>(null);
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [shouldUpdateBalance, setShouldUpdateBalance] = useState<boolean>(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accounts[0]?.id || 'acc-1'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Israeli sample CSV for users who want to see how a statement looks
  const sampleBankCsv = `תאריך,תיאור,חובה,זכות,יתרה
02/09/2026,סופר-פארם קניון רמת אביב,189.90,,14250.00
02/09/2026,תחנת דלק סונול גלילות,270.00,,14439.90
01/09/2026,העברה מחברת הייטק בע״מ,,18500.00,14709.90
01/09/2026,גולדה גלידה תל אביב,46.00,,-3790.10
31/08/2026,מחסני להב רמת השרון,540.20,,-3744.10
30/08/2026,איקאה נתניה,480.00,,-3203.90`;

  const processParsedResult = (result: ParsedBankResult, name: string) => {
    setFileName(name);
    setParseError(null);

    if (result.transactions.length === 0) {
      setParseError('לא זוהו שורות תנועה תקינות בקובץ. אנא ודא שהקובץ כולל עמודות תאריך, תיאור וסכום.');
      setParsedData(null);
      return;
    }

    // Mark duplicates against existing transactions
    const transactionsWithDups = result.transactions.map((tx) => {
      const isDup = existingTransactions.some(
        (ex) =>
          ex.date === tx.date &&
          Math.abs(ex.amount - tx.amount) < 0.01 &&
          (ex.description.trim().toLowerCase() === tx.description.trim().toLowerCase() ||
            (tx.reference && ex.notes?.includes(tx.reference)))
      );
      return { ...tx, isDuplicate: isDup };
    });

    const enrichedResult: ParsedBankResult = {
      ...result,
      transactions: transactionsWithDups,
    };

    setParsedData(enrichedResult);

    // Default: select all non-duplicate transactions
    const initialSelected = new Set<string>();
    transactionsWithDups.forEach((tx) => {
      if (!tx.isDuplicate) {
        initialSelected.add(tx.id);
      }
    });
    // If all are marked duplicates, select all anyway so the user can choose
    if (initialSelected.size === 0 && transactionsWithDups.length > 0) {
      transactionsWithDups.forEach((tx) => initialSelected.add(tx.id));
    }
    setSelectedTxIds(initialSelected);
  };

  const handleFileChange = async (file: File) => {
    setIsProcessing(true);
    setParseError(null);

    try {
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        // Read as ArrayBuffer for SheetJS
        const buffer = await file.arrayBuffer();
        const result = parseExcelBuffer(buffer);
        processParsedResult(result, file.name);
      } else {
        // Read as Text for CSV / TSV / TXT
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const result = parseTextStatement(text);
          processParsedResult(result, file.name);
          setIsProcessing(false);
        };
        reader.onerror = () => {
          setParseError('שגיאה בקריאת הקובץ מהמחשב.');
          setIsProcessing(false);
        };
        // Try UTF-8
        reader.readAsText(file, 'utf-8');
        return; // reader will finish asynchronously
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setParseError('שגיאה בניתוח הקובץ: ' + (err?.message || 'פורמט לא מוכר'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      setParseError('נא להדביק שורות תנועות');
      return;
    }
    setIsProcessing(true);
    try {
      const result = parseTextStatement(pastedText);
      processParsedResult(result, 'שורות שהודבקו');
    } catch (err: any) {
      setParseError('שגיאה בניתוח הטקסט: ' + (err?.message || 'פורמט לא מוכר'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = () => {
    setPastedText(sampleBankCsv);
    const result = parseTextStatement(sampleBankCsv);
    processParsedResult(result, 'קובץ דוגמה ישראלי');
  };

  const toggleSelectTx = (id: string) => {
    const next = new Set(selectedTxIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTxIds(next);
  };

  const toggleSelectAll = () => {
    if (!parsedData) return;
    if (selectedTxIds.size === parsedData.transactions.length) {
      setSelectedTxIds(new Set());
    } else {
      setSelectedTxIds(new Set(parsedData.transactions.map((t) => t.id)));
    }
  };

  const deselectDuplicates = () => {
    if (!parsedData) return;
    const next = new Set<string>();
    parsedData.transactions.forEach((tx) => {
      if (!tx.isDuplicate) next.add(tx.id);
    });
    setSelectedTxIds(next);
  };

  const handleConfirmImport = () => {
    if (!parsedData) return;

    const toImport: Transaction[] = parsedData.transactions
      .filter((tx) => selectedTxIds.has(tx.id))
      .map((tx, idx) => ({
        id: `imp-${Date.now()}-${idx}`,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        type: tx.type,
        category: tx.category || 'אחר',
        subCategory: tx.subCategory || '',
        accountId: selectedAccountId,
        notes: tx.reference ? `אסמכתא: ${tx.reference}` : 'יובא מקובץ בנק',
        isFixed: false,
        isBusiness: false,
      }));

    const balanceUpdate =
      shouldUpdateBalance && parsedData.closingBalance !== undefined
        ? parsedData.closingBalance
        : undefined;

    if (toImport.length > 0 || balanceUpdate !== undefined) {
      onImport(toImport, balanceUpdate);
    }
    onClose();
  };

  const duplicateCount =
    parsedData?.transactions.filter((t) => t.isDuplicate).length || 0;
  const selectedCount = selectedTxIds.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between bg-gray-50/60 dark:bg-[#1A2021]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00B894] flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-[#2D3436] dark:text-white">
                  ייבוא תנועות אמיתיות מהבנק וכרטיסי אשראי
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894]">
                  Excel / CSV
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                קריאה ישירה של קבצי תנועות מכל הבנקים וכרטיסי האשראי בישראל — ללא שום הוצאות מומצאות.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#191D1E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#E1E8E7] dark:border-[#2D3636] bg-gray-50/70 dark:bg-[#191D1E]/70 text-xs font-bold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-[#00B894] text-[#00B894]'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>העלאת קובץ Excel / CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-[#00B894] text-[#00B894]'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>הדבקת שורות טבלה</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-[#00B894] text-[#00B894]'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>איך מורידים קובץ מהבנק?</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Error Banner */}
          {parseError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'upload' && !parsedData && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  dragActive
                    ? 'border-[#00B894] bg-[#EBF7F5]/50 dark:bg-[#00B894]/10 scale-[0.99]'
                    : 'border-[#E1E8E7] dark:border-[#2D3636] hover:border-[#00B894] bg-[#F4F7F6]/50 dark:bg-[#191D1E]/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.tsv,.txt"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs flex items-center justify-center text-[#00B894]">
                  <Upload className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#2D3436] dark:text-white">
                    גרור לכאן את קובץ האקסל או ה-CSV שהורדת מהבנק
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    או לחץ כאן לבחירת קובץ מהמחשב (תמיכה מלאה ב-XLSX, XLS, CSV)
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                  <span className="px-2 py-0.5 rounded bg-gray-200/60 dark:bg-[#2D3636] text-[10px] text-gray-600 dark:text-gray-300 font-medium">
                    בנק הפועלים
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-200/60 dark:bg-[#2D3636] text-[10px] text-gray-600 dark:text-gray-300 font-medium">
                    לאומי
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-200/60 dark:bg-[#2D3636] text-[10px] text-gray-600 dark:text-gray-300 font-medium">
                    דיסקונט
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-200/60 dark:bg-[#2D3636] text-[10px] text-gray-600 dark:text-gray-300 font-medium">
                    מזרחי טפחות
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-200/60 dark:bg-[#2D3636] text-[10px] text-gray-600 dark:text-gray-300 font-medium">
                    ישראכרט
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-200/60 dark:bg-[#2D3636] text-[10px] text-gray-600 dark:text-gray-300 font-medium">
                    כאל
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-200/60 dark:bg-[#2D3636] text-[10px] text-gray-600 dark:text-gray-300 font-medium">
                    מקס
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 text-xs text-[#00B894] hover:underline font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>רוצה לראות איך זה עובד? טען קובץ דוגמה ישראלי</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PASTE TEXT */}
          {activeTab === 'paste' && !parsedData && (
            <div className="space-y-3">
              <div>
                <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">
                  הדבק שורות מטבלת הבנק (תאריך, תיאור, חובה, זכות או סכום):
                </label>
                <textarea
                  rows={7}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="סמן את השורות באתר הבנק, לחץ Ctrl+C והדבק כאן (Ctrl+V)..."
                  className="w-full p-3 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] font-mono text-xs text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 text-xs text-[#00B894] hover:underline font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>טען נתוני דוגמה ישראליים</span>
                </button>

                <button
                  type="button"
                  onClick={handleParsePastedText}
                  disabled={!pastedText.trim() || isProcessing}
                  className="px-4 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A382] disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs"
                >
                  {isProcessing ? 'מנתח שורות...' : 'נתח שורות והצג תצוגה מקדימה'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DOWNLOAD GUIDE */}
          {activeTab === 'guide' && !parsedData && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/60 dark:bg-[#00B894]/10 border border-emerald-200 dark:border-[#00B894]/20 rounded-2xl">
                <h3 className="font-bold text-sm text-[#2D3436] dark:text-white mb-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#00B894]" />
                  <span>איך מורידים קובץ תנועות מהבנק או כרטיס האשראי?</span>
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  כל מוסד פיננסי בישראל מאפשר לייצא את התנועות בלחיצת כפתור אחת:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] rounded-xl">
                  <span className="font-bold text-red-600 dark:text-red-400 block mb-1">
                    בנק הפועלים
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                    היכנס ל"עובר ושב" ← לחץ על סמל האקסל או "ייצוא לאקסל" בראש טבלת התנועות ← גרור את הקובץ לכאן.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] rounded-xl">
                  <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                    בנק לאומי
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                    היכנס ל"ריכוז תנועות בעו״ש" ← לחץ על כפתור "הורדה / הדפסה" ← בחר "קובץ Excel" ← שמור וגרור לכאן.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] rounded-xl">
                  <span className="font-bold text-green-600 dark:text-green-400 block mb-1">
                    בנק דיסקונט
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                    היכנס ל"פעולות בחשבון" ← סנן את התאריכים הרצויים ← לחץ על אייקון האקסל בצד שמאל למעלה.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] rounded-xl">
                  <span className="font-bold text-orange-600 dark:text-orange-400 block mb-1">
                    מזרחי טפחות
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                    עבור ל"תנועות בחשבון" ← לחץ על "ייצוא" ובחר פורמט Excel או CSV.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] rounded-xl">
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 block mb-1">
                    ישראכרט / Cal / Max
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                    היכנס לפירוט עסקאות חודשי ← לחץ על "ייצוא לאקסל" בראש עמוד הפירוט ← העלה את הקובץ לכאן.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] rounded-xl">
                  <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">
                    העתק-הדבק מהיר
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                    ניתן גם פשוט לסמן את השורות עם העכבר באתר הבנק, להעתיק (Ctrl+C), לעבור ללשונית "הדבקת שורות" ולהדביק!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PARSED DATA PREVIEW & CONFIRMATION */}
          {parsedData && (
            <div className="space-y-4 animate-in fade-in">
              {/* Summary Strip */}
              <div className="p-4 bg-gradient-to-r from-[#EBF7F5] to-emerald-50 dark:from-[#00B894]/15 dark:to-[#191D1E] rounded-2xl border border-[#00B894]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#2D3436] dark:text-white">
                      {fileName || 'קובץ תנועות'}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#00B894] text-white">
                      {parsedData.detectedBank}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                    זוהו <strong className="text-[#2D3436] dark:text-white">{parsedData.totalCount}</strong> תנועות אמיתיות בקובץ
                    (הוצאות: ₪{parsedData.totalDebits.toLocaleString()} | הכנסות: ₪{parsedData.totalCredits.toLocaleString()})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setParsedData(null);
                      setFileName('');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202728] hover:bg-gray-50 text-xs font-bold transition-colors"
                  >
                    טען קובץ אחר
                  </button>
                </div>
              </div>

              {/* Target Account & Closing Balance Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 dark:bg-[#191D1E] rounded-xl border border-[#E1E8E7] dark:border-[#2D3636]">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                    ייבא לחשבון / כרטיס:
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E1E8E7] dark:border-[#2D3636] bg-white dark:bg-[#202728] text-xs font-medium text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        🏦 {a.name} ({a.bankName}) - יתרה: ₪{a.balance.toLocaleString()}
                      </option>
                    ))}
                    {creditCards.map((c) => (
                      <option key={c.id} value={c.id}>
                        💳 {c.name} (סיום {c.lastFourDigits})
                      </option>
                    ))}
                  </select>
                </div>

                {parsedData.closingBalance !== undefined && (
                  <div className="flex items-center">
                    <label className="flex items-start gap-2 cursor-pointer mt-3 sm:mt-4">
                      <input
                        type="checkbox"
                        checked={shouldUpdateBalance}
                        onChange={(e) => setShouldUpdateBalance(e.target.checked)}
                        className="mt-0.5 accent-[#00B894] w-4 h-4 rounded"
                      />
                      <span className="text-xs text-[#2D3436] dark:text-white font-medium leading-tight">
                        עדכן יתרת עו״ש לפי יתרת הסגירה בקובץ:{' '}
                        <strong className="text-[#00B894] font-mono">
                          ₪{parsedData.closingBalance.toLocaleString()}
                        </strong>
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Duplicate Alert & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#2D3436] dark:text-white">
                    נבחרו {selectedCount} מתוך {parsedData.transactions.length} תנועות
                  </span>

                  {duplicateCount > 0 && (
                    <span className="text-[#D6A317] dark:text-[#FDCB6E] flex items-center gap-1 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{duplicateCount} תנועות זוהו ככפולות</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {duplicateCount > 0 && (
                    <button
                      type="button"
                      onClick={deselectDuplicates}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[#D6A317] dark:text-[#FDCB6E] border border-amber-200 dark:border-amber-800 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                    >
                      בטל סימון כפילויות
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs text-[#00B894] hover:underline font-bold"
                  >
                    {selectedCount === parsedData.transactions.length ? 'בטל בחירת הכל' : 'בחר הכל'}
                  </button>
                </div>
              </div>

              {/* Transactions Table Preview */}
              <div className="border border-[#E1E8E7] dark:border-[#2D3636] rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#F4F7F6] dark:bg-[#191D1E] border-b border-[#E1E8E7] dark:border-[#2D3636] text-gray-500 dark:text-gray-400 sticky top-0 z-10 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCount === parsedData.transactions.length && parsedData.transactions.length > 0}
                          onChange={toggleSelectAll}
                          className="accent-[#00B894] w-3.5 h-3.5 rounded"
                        />
                      </th>
                      <th className="py-2.5 px-3">תאריך</th>
                      <th className="py-2.5 px-3">בית עסק / תיאור פעולה</th>
                      <th className="py-2.5 px-3">סכום</th>
                      <th className="py-2.5 px-3">קטגוריה</th>
                      <th className="py-2.5 px-3">סטטוס</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E8E7] dark:divide-[#2D3636]">
                    {parsedData.transactions.map((tx) => {
                      const isSelected = selectedTxIds.has(tx.id);
                      return (
                        <tr
                          key={tx.id}
                          onClick={() => toggleSelectTx(tx.id)}
                          className={`cursor-pointer transition-colors ${
                            !isSelected
                              ? 'opacity-40 bg-gray-50/50 dark:bg-[#191D1E]/50'
                              : tx.isDuplicate
                              ? 'bg-amber-50/50 dark:bg-amber-950/20'
                              : 'hover:bg-[#F4F7F6]/80 dark:hover:bg-[#191D1E]/80'
                          }`}
                        >
                          <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectTx(tx.id)}
                              className="accent-[#00B894] w-3.5 h-3.5 rounded"
                            />
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                            {tx.date}
                          </td>
                          <td className="py-2 px-3 font-medium text-[#2D3436] dark:text-white">
                            <div>
                              <span>{tx.description}</span>
                              {tx.reference && (
                                <span className="text-[10px] text-gray-400 block">
                                  אסמכתא: {tx.reference}
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            className={`py-2 px-3 font-mono font-bold whitespace-nowrap ${
                              tx.type === 'income' ? 'text-[#00B894]' : 'text-[#2D3436] dark:text-white'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'}₪{tx.amount.toLocaleString()}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] font-bold text-[10px]">
                              {tx.category}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-[11px]">
                            {tx.isDuplicate ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-[#D6A317] dark:text-amber-300 font-bold text-[10px]">
                                כפולה
                              </span>
                            ) : (
                              <span className="text-[#00B894] font-bold text-[10px]">חדשה</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E1E8E7] dark:border-[#2D3636] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F4F7F6]/60 dark:bg-[#191D1E]/60">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00B894] shrink-0" />
            <span>התנועות נשמרות מקומית בדפדפן שלך בפרטיות מוחלטת.</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] text-[#2D3436] dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-[#191D1E] transition-colors"
            >
              ביטול
            </button>

            {parsedData && (
              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A382] disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>ייבא {selectedCount} תנועות למערכת</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
