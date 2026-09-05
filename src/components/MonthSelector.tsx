import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar, RotateCcw, Check } from 'lucide-react';
import { HEBREW_MONTH_NAMES, getHebrewMonthLabel } from '../utils/financeEngine';
import { MonthSummary } from '../types';

interface MonthSelectorProps {
  selectedMonth: string; // 'YYYY-MM'
  onSelectMonth: (monthKey: string) => void;
  monthlySummaries?: MonthSummary[];
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onSelectMonth,
  monthlySummaries = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  // Parse selected month safely
  const safeMonthKey =
    typeof selectedMonth === 'string' && selectedMonth.includes('-')
      ? selectedMonth
      : currentMonthKey;
  const isCurrentMonth = safeMonthKey === currentMonthKey;
  const [yearStr, monthStr] = safeMonthKey.split('-');
  const year = parseInt(yearStr, 10) || now.getFullYear();
  const month = parseInt(monthStr, 10) || now.getMonth() + 1;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    const prevDate = new Date(year, month - 2, 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    onSelectMonth(prevKey);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, month, 1);
    const nextKey = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    onSelectMonth(nextKey);
  };

  const handleResetToCurrent = () => {
    onSelectMonth(currentMonthKey);
    setIsOpen(false);
  };

  // Generate selectable months for dropdown (current year, previous year, and next year)
  const selectableMonths: { key: string; label: string; year: number; month: number }[] = [];
  const years = [year - 1, year, year + 1];
  years.forEach((y) => {
    for (let m = 1; m <= 12; m++) {
      const key = `${y}-${String(m).padStart(2, '0')}`;
      selectableMonths.push({
        key,
        label: `${HEBREW_MONTH_NAMES[m - 1]} ${y}`,
        year: y,
        month: m,
      });
    }
  });

  // Current month summary if available
  const currentSummary = monthlySummaries.find((s) => s.monthKey === selectedMonth);

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <div className="flex items-center bg-[#F4F7F6] dark:bg-[#191D1E] p-1 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
        {/* Next Month Button (RTL: right is next, left is prev or vice-versa) */}
        <button
          onClick={handleNextMonth}
          title="חודש הבא"
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#252D2E] text-gray-500 dark:text-gray-400 hover:text-[#2D3436] dark:hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Center Button - Opens Dropdown */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-white dark:hover:bg-[#252D2E] text-xs font-black text-[#2D3436] dark:text-white transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-[#00B894]" />
          <span>{getHebrewMonthLabel(selectedMonth)}</span>
          {isCurrentMonth ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] font-bold">
              נוכחי
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-medium">
              חודש עבר
            </span>
          )}
        </button>

        {/* Prev Month Button */}
        <button
          onClick={handlePrevMonth}
          title="חודש קודם"
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#252D2E] text-gray-500 dark:text-gray-400 hover:text-[#2D3436] dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Return to Current Month Button if looking at another month */}
      {!isCurrentMonth && (
        <button
          onClick={handleResetToCurrent}
          className="mr-2 hidden sm:flex items-center gap-1 text-[11px] font-bold text-[#00B894] hover:text-[#00A382] px-2.5 py-1 rounded-lg bg-[#EBF7F5] dark:bg-[#00B894]/15 border border-[#D1EAE5] dark:border-[#00B894]/30 transition-colors"
          title="חזרה לחודש הנוכחי"
        >
          <RotateCcw className="w-3 h-3" />
          <span>חזרה להיום</span>
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-50 w-[290px] sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#202728] rounded-2xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-xl p-3 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E1E8E7] dark:border-[#2D3636] text-xs font-bold text-gray-500 dark:text-gray-400">
            <span>בחר חודש לצפייה וניתוח</span>
            {!isCurrentMonth && (
              <button
                onClick={handleResetToCurrent}
                className="text-[#00B894] hover:underline text-[11px]"
              >
                חודש נוכחי
              </button>
            )}
          </div>

          <div className="space-y-1">
            {monthlySummaries.length > 0
              ? monthlySummaries.map((summary) => {
                  const isSel = summary.monthKey === selectedMonth;
                  const isNow = summary.isCurrentMonth;
                  return (
                    <button
                      key={summary.monthKey}
                      onClick={() => {
                        onSelectMonth(summary.monthKey);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right text-xs transition-all ${
                        isSel
                          ? 'bg-[#EBF7F5] dark:bg-[#00B894]/20 border border-[#00B894]/30 font-bold text-[#00B894]'
                          : 'hover:bg-[#F4F7F6] dark:hover:bg-[#191D1E] text-[#2D3436] dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSel && <Check className="w-3.5 h-3.5 text-[#00B894]" />}
                        <span className="font-semibold">{summary.label}</span>
                        {isNow && (
                          <span className="text-[9px] px-1 rounded bg-[#00B894] text-white">
                            נוכחי
                          </span>
                        )}
                      </div>

                      <div className="text-left text-[11px] font-mono">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-[#00B894]">+{summary.income.toLocaleString()}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-[#FF7675]">-{summary.expense.toLocaleString()}</span>
                        </div>
                        <div
                          className={`text-[10px] font-bold ${
                            summary.net >= 0 ? 'text-[#00B894]' : 'text-[#FF7675]'
                          }`}
                        >
                          מאזן: {summary.net >= 0 ? '+' : ''}₪{summary.net.toLocaleString()}
                        </div>
                      </div>
                    </button>
                  );
                })
              : // Fallback list if summaries aren't loaded yet
                selectableMonths.slice(6, 18).map((m) => {
                  const isSel = m.key === selectedMonth;
                  const isNow = m.key === currentMonthKey;
                  return (
                    <button
                      key={m.key}
                      onClick={() => {
                        onSelectMonth(m.key);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-right text-xs transition-all ${
                        isSel
                          ? 'bg-[#EBF7F5] dark:bg-[#00B894]/20 font-bold text-[#00B894]'
                          : 'hover:bg-[#F4F7F6] dark:hover:bg-[#191D1E] text-[#2D3436] dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSel && <Check className="w-3.5 h-3.5 text-[#00B894]" />}
                        <span>{m.label}</span>
                        {isNow && (
                          <span className="text-[9px] px-1 rounded bg-[#00B894] text-white">
                            היום
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
};
