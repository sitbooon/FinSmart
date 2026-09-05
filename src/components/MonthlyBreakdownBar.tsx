import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { MonthSummary } from '../types';

interface MonthlyBreakdownBarProps {
  monthlySummaries: MonthSummary[];
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
}

export const MonthlyBreakdownBar: React.FC<MonthlyBreakdownBarProps> = ({
  monthlySummaries,
  selectedMonth,
  onSelectMonth,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!monthlySummaries || monthlySummaries.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#202728] rounded-2xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs p-3.5 mb-6 transition-all">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EBF7F5] dark:bg-[#00B894]/20 flex items-center justify-center text-[#00B894]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#2D3436] dark:text-white flex items-center gap-1.5">
              <span>חלוקה והשוואה חודשית — הכנסות מול הוצאות</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#191D1E] text-gray-500">
                לחצו על חודש למעבר מהיר
              </span>
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-[#F4F7F6] dark:hover:bg-[#191D1E] text-gray-400 hover:text-gray-600 transition-colors text-xs flex items-center gap-1 font-semibold"
          title={isCollapsed ? 'הרחב סרגל חודשים' : 'צמצם סרגל חודשים'}
        >
          <span className="hidden sm:inline">{isCollapsed ? 'הצג חודשים' : 'הסתר'}</span>
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Month cards strip */}
      {!isCollapsed && (
        <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-7 gap-2.5 overflow-x-auto pb-2 no-scrollbar snap-x">
          {monthlySummaries.map((item) => {
            const isSelected = item.monthKey === selectedMonth;
            const isPositive = item.net >= 0;

            return (
              <button
                key={item.monthKey}
                onClick={() => onSelectMonth(item.monthKey)}
                className={`p-2.5 rounded-xl text-right transition-all flex flex-col justify-between relative group shrink-0 min-w-[130px] sm:min-w-0 snap-start ${
                  isSelected
                    ? 'bg-[#EBF7F5] dark:bg-[#00B894]/15 border-2 border-[#00B894] shadow-xs'
                    : 'bg-[#F9FBFA] dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636] hover:border-[#00B894]/40 hover:bg-white dark:hover:bg-[#202728]'
                }`}
              >
                {/* Month title & badge */}
                <div className="flex items-center justify-between w-full mb-2">
                  <span
                    className={`text-xs font-black truncate ${
                      isSelected
                        ? 'text-[#00B894]'
                        : 'text-[#2D3436] dark:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.isCurrentMonth && (
                    <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-[#00B894] text-white">
                      עכשיו
                    </span>
                  )}
                </div>

                {/* Income vs Expense lines */}
                <div className="space-y-1 w-full text-[11px] font-mono">
                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                    <span className="text-[10px] flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>הכנסות:</span>
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ₪{item.income.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                    <span className="text-[10px] flex items-center gap-0.5 text-rose-500">
                      <TrendingDown className="w-3 h-3" />
                      <span>הוצאות:</span>
                    </span>
                    <span className="font-bold text-rose-500">
                      ₪{item.expense.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Net balance line */}
                <div className="mt-2 pt-1.5 border-t border-gray-200 dark:border-gray-800 w-full flex items-center justify-between text-[11px]">
                  <span className="text-[10px] text-gray-400">מאזן:</span>
                  <span
                    className={`font-black ${
                      isPositive ? 'text-[#00B894]' : 'text-[#FF7675]'
                    }`}
                  >
                    {isPositive ? '+' : ''}₪{item.net.toLocaleString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
