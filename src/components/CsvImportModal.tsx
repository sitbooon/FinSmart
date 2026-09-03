import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Transaction } from '../types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Transaction[]) => void;
  existingTransactions: Transaction[];
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingTransactions,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);

  if (!isOpen) return null;

  // Sample Israeli bank CSV format for quick test
  const sampleBankCsv = `תאריך,תיאור,חובה,זכות,קטגוריה
2026-09-02,סופר-פארם קניון רמת אביב,189.90,,בריאות ופארם
2026-09-03,תחנת דלק סונול גלילות,270.00,,רכב ודלק
2026-09-03,העברה מחברת הייטק בע״מ,,18500.00,משכורת
2026-09-04,גולדה גלידה תל אביב,46.00,,מסעדות ובילויים
2026-09-05,מחסני להב רמת השרון,540.20,,סופר ומזון
2026-09-06,אייקאה נתניה,480.00,,בית ודיור`;

  const handleLoadSample = () => {
    setCsvText(sampleBankCsv);
    handleParseText(sampleBankCsv);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      handleParseText(content);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleParseText = async (text: string) => {
    setIsProcessing(true);
    let rows: any[] = [];

    try {
      // Call backend CSV parse endpoint
      const response = await fetch('/api/csv/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: text, csvText: text }),
      });

      if (response.ok) {
        const data = await response.json();
        rows = data.records || data.transactions || [];
      } else {
        throw new Error('Server returned error');
      }
    } catch (err) {
      // Robust client-side fallback parsing (works offline and on static deployments)
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 3) {
          const date = parts[0] || new Date().toISOString().split('T')[0];
          const desc = parts[1] || 'תנועה מיובאת';
          const amtNum = parseFloat(parts[2].replace(/[^\d.-]/g, '')) || 0;
          const cat = parts[4] || 'אחר';

          rows.push({
            id: `csv-${Date.now()}-${i}`,
            date,
            description: desc,
            amount: Math.abs(amtNum),
            type: amtNum < 0 ? 'expense' : desc.includes('משכורת') || amtNum > 0 ? 'income' : 'expense',
            category: cat,
            subCategory: '',
            isRecurring: false,
            isBusiness: false,
            notes: 'יובא מקובץ CSV',
          });
        }
      }
    } finally {
      // Check duplicates against existing transactions
      let dups = 0;
      const validRows = rows.map((r: any) => {
        const isDup = existingTransactions.some(
          (ex) =>
            ex.date === r.date &&
            ex.amount === r.amount &&
            ex.description.trim().toLowerCase() === r.description.trim().toLowerCase()
        );
        if (isDup) dups++;
        return { ...r, isDuplicate: isDup };
      });

      setDuplicateCount(dups);
      setParsedRows(validRows);
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    // Only import non-duplicate or all if user wants
    const toAdd: Transaction[] = parsedRows
      .filter((r) => !r.isDuplicate)
      .map((r, idx) => ({
        id: `csv-${Date.now()}-${idx}`,
        date: r.date,
        description: r.description,
        amount: r.amount,
        type: r.type,
        category: r.category || 'אחר',
        accountId: 'acc-1',
        isFixed: false,
        isBusiness: false,
      }));

    if (toAdd.length > 0) {
      onImport(toAdd);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EBF7F5] dark:bg-[#00B894]/20 flex items-center justify-center text-[#00B894]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#2D3436] dark:text-white">
                ייבוא תנועות מקובץ CSV / אקסל
              </h2>
              <p className="text-[11px] text-gray-400">
                תמיכה בפורמטי בנקים וכרטיסי אשראי ישראליים ומניעת כפילויות
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
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white font-bold transition-colors shadow-xs">
              <Upload className="w-4 h-4" />
              <span>בחר קובץ CSV מהמחשב</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] hover:bg-[#E1E8E7] dark:hover:bg-[#2D3636] text-[#2D3436] dark:text-white font-bold border border-[#E1E8E7] dark:border-[#2D3636] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FDCB6E]" />
              <span>טען קובץ דוגמה ישראלי</span>
            </button>
          </div>

          {/* Raw text preview area */}
          <div>
            <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
              תוכן הקובץ (ניתן גם להדביק שורות ישירות):
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                handleParseText(e.target.value);
              }}
              placeholder="הדבק כאן תוכן CSV או לחץ על 'טען קובץ דוגמה'..."
              className="w-full p-2.5 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] font-mono text-[11px] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
            />
          </div>

          {/* Parsed records table preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2D3436] dark:text-white">
                  תצוגה מקדימה: זוהו {parsedRows.length} תנועות
                </span>
                {duplicateCount > 0 && (
                  <span className="text-[#D48806] dark:text-[#FDCB6E] flex items-center gap-1 font-bold text-[11px]">
                    <AlertCircle className="w-3 h-3" />
                    <span>{duplicateCount} תנועות זוהו ככפולות וידולגו</span>
                  </span>
                )}
              </div>

              <div className="border border-[#E1E8E7] dark:border-[#2D3636] rounded-xl overflow-x-auto max-h-56">
                <table className="w-full text-right text-[11px]">
                  <thead className="bg-[#F4F7F6] dark:bg-[#191D1E] border-b border-[#E1E8E7] dark:border-[#2D3636] text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="py-2 px-3">תאריך</th>
                      <th className="py-2 px-3">תיאור</th>
                      <th className="py-2 px-3">סכום</th>
                      <th className="py-2 px-3">סיווג אוטומטי</th>
                      <th className="py-2 px-3">סטטוס</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E8E7] dark:divide-[#2D3636]">
                    {parsedRows.map((r, i) => (
                      <tr
                        key={i}
                        className={
                          r.isDuplicate
                            ? 'bg-[#FDCB6E]/10 opacity-60'
                            : 'hover:bg-[#F4F7F6]/60 dark:hover:bg-[#191D1E]/60'
                        }
                      >
                        <td className="py-2 px-3 font-mono">{r.date}</td>
                        <td className="py-2 px-3 font-medium text-[#2D3436] dark:text-white">
                          {r.description}
                        </td>
                        <td
                          className={`py-2 px-3 font-mono font-bold ${
                            r.type === 'income' ? 'text-[#00B894]' : 'text-[#2D3436] dark:text-white'
                          }`}
                        >
                          {r.type === 'income' ? '+' : '-'}₪{r.amount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3">
                          <span className="bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] px-2 py-0.5 rounded-md text-[10px] font-bold">
                            {r.category || 'אחר'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {r.isDuplicate ? (
                            <span className="text-[#D48806] dark:text-[#FDCB6E] font-bold">כפולה</span>
                          ) : (
                            <span className="text-[#00B894] font-bold">חדשה</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E1E8E7] dark:border-[#2D3636] flex justify-end gap-2 bg-[#F4F7F6]/50 dark:bg-[#191D1E]/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] text-[#2D3436] dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-[#191D1E] transition-colors"
          >
            ביטול
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A383] disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-xs"
          >
            אשר וייבא {parsedRows.filter((r) => !r.isDuplicate).length} תנועות
          </button>
        </div>
      </div>
    </div>
  );
};
