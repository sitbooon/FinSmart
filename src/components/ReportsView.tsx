import React, { useState } from 'react';
import {
  FileBarChart2,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
} from 'lucide-react';
import {
  Account,
  Investment,
  Debt,
  FinancialSnapshot,
  Transaction,
  CreditCard,
} from '../types';

interface ReportsViewProps {
  snapshot: FinancialSnapshot;
  accounts: Account[];
  investments: Investment[];
  debts: Debt[];
  transactions: Transaction[];
  creditCards: CreditCard[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  snapshot,
  accounts,
  investments,
  debts,
  transactions,
  creditCards,
}) => {
  const [reportPeriod, setReportPeriod] = useState<'current_month' | 'last_month' | 'annual'>('current_month');

  // Calculate Net Worth
  const totalBankAssets = accounts.reduce((s, a) => s + a.balance, 0);
  const totalInvestmentAssets = investments.reduce((s, i) => s + i.currentValue, 0);
  const estimatedRealEstateValue = 2400000; // Realistic Israeli family asset
  const estimatedVehicleValue = 85000;

  const totalAssets =
    totalBankAssets + totalInvestmentAssets + estimatedRealEstateValue + estimatedVehicleValue;

  const totalDebts = debts.reduce((s, d) => s + d.currentBalance, 0);
  const totalCreditLiabilities = creditCards.reduce((s, c) => s + c.currentBillingTotal, 0);
  const totalLiabilities = totalDebts + totalCreditLiabilities;

  const netWorth = totalAssets - totalLiabilities;

  // Monthly category breakdown
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const categoryEntries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const totalExpenseSum = categoryEntries.reduce((s, e) => s + e[1], 0);

  const handleExportCsv = () => {
    // Generate CSV in browser
    const headers = 'תאריך,תיאור,סכום,סוג,קטגוריה\n';
    const rows = transactions
      .map((t) => `${t.date},"${t.description}",${t.amount},${t.type},${t.category}`)
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinOS_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D3436] dark:text-white flex items-center gap-2">
            <FileBarChart2 className="w-6 h-6 text-[#00B894]" />
            <span>שווי נקי, ניתוח ודוחות פיננסיים</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            תמונת מאזן כוללת (נכסים מול התחייבויות) ופילוח הוצאות חודשי מקיף
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>ייצוא דוח לאקסל / CSV</span>
        </button>
      </div>

      {/* Net Worth Master Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#00B894]">שווי נקי כולל (Net Worth)</div>
            <div className="text-3xl sm:text-4xl font-black text-[#2D3436] dark:text-white tracking-tight mt-1 font-mono">
              ₪{netWorth.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              סך נכסים (עו״ש, השקעות, נדל״ן, רכב) בניכוי התחייבויות (משכנתא, הלוואות, אשראי)
            </p>
          </div>

          <div className="flex gap-6 text-right">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">סה״כ נכסים</div>
              <div className="text-lg sm:text-xl font-black text-[#00B894] font-mono">
                ₪{totalAssets.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">סה״כ התחייבויות</div>
              <div className="text-lg sm:text-xl font-black text-[#FF7675] font-mono">
                -₪{totalLiabilities.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Balance breakdown bars */}
        <div className="mt-6 pt-6 border-t border-[#E1E8E7] dark:border-[#2D3636] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636]">
            <span className="text-gray-500 dark:text-gray-400 block mb-0.5">עו״ש וחיסכון נזיל</span>
            <span className="font-mono font-black text-[#2D3436] dark:text-white text-sm">
              ₪{totalBankAssets.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636]">
            <span className="text-gray-500 dark:text-gray-400 block mb-0.5">השקעות, גמל ופנסיה</span>
            <span className="font-mono font-black text-[#2D3436] dark:text-white text-sm">
              ₪{totalInvestmentAssets.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636]">
            <span className="text-gray-500 dark:text-gray-400 block mb-0.5">משכנתא והלוואות</span>
            <span className="font-mono font-black text-[#FF7675] text-sm">
              -₪{totalDebts.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636]">
            <span className="text-gray-500 dark:text-gray-400 block mb-0.5">חיובי אשראי קרובים</span>
            <span className="font-mono font-black text-[#FF7675] text-sm">
              -₪{totalCreditLiabilities.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category List */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#2D3436] dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#00B894]" />
            <span>פילוח הוצאות החודש לפי קטגוריות</span>
          </h2>

          <div className="space-y-3">
            {categoryEntries.map(([cat, amount]) => {
              const pct = totalExpenseSum > 0 ? Math.round((amount / totalExpenseSum) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#2D3436] dark:text-white">{cat}</span>
                    <span className="font-mono font-bold text-[#2D3436] dark:text-white">
                      ₪{amount.toLocaleString()}{' '}
                      <span className="text-[11px] font-normal text-gray-400 font-sans">
                        ({pct}%)
                      </span>
                    </span>
                  </div>

                  <div className="w-full bg-[#F4F7F6] dark:bg-[#191D1E] h-2 rounded-full overflow-hidden border border-[#E1E8E7]/40 dark:border-[#2D3636]/40">
                    <div
                      className="bg-[#00B894] h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Flow Overview */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#2D3436] dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00B894]" />
            <span>סיכום תנועות תזרימיות לחודש זה</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#EBF7F5] dark:bg-[#00B894]/10 border border-[#00B894]/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#2D3436] dark:text-white">הכנסות בפועל</div>
                <div className="text-[11px] text-gray-400">משכורות ותשלומים שנכנסו</div>
              </div>
              <div className="font-mono font-black text-sm text-[#00B894]">
                +₪{snapshot.monthIncomeActual.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#2D3436] dark:text-white">הכנסות נוספות שנותרו</div>
                <div className="text-[11px] text-gray-400">צפויות להגיע עד סוף החודש</div>
              </div>
              <div className="font-mono font-bold text-sm text-[#00B894]">
                +₪{snapshot.pendingIncomesThisMonth.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FF7675]/10 border border-[#FF7675]/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#2D3436] dark:text-white">הוצאות בפועל עד כה</div>
                <div className="text-[11px] text-gray-400">שוטפות ומזדמנות</div>
              </div>
              <div className="font-mono font-black text-sm text-[#FF7675]">
                -₪{snapshot.monthExpenseActual.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FF7675]/10 border border-[#FF7675]/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#2D3436] dark:text-white">הוצאות קבועות שנותרו</div>
                <div className="text-[11px] text-gray-400">משכנתא, ביטוחים, מנויים</div>
              </div>
              <div className="font-mono font-black text-sm text-[#FF7675]">
                -₪{snapshot.pendingFixedExpenses.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FDCB6E]/15 border border-[#FDCB6E]/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-[#2D3436] dark:text-white">חיובי כרטיסי אשראי</div>
                <div className="text-[11px] text-gray-400">במועדי הפירעון הקרובים</div>
              </div>
              <div className="font-mono font-black text-sm text-[#D48806] dark:text-[#FDCB6E]">
                -₪{snapshot.upcomingCreditCardBills.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
