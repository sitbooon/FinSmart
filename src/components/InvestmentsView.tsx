import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  Plus,
  Trash2,
  Percent,
  Building,
  Coins,
  Shield,
  BarChart3,
} from 'lucide-react';
import { Investment } from '../types';

interface InvestmentsViewProps {
  investments: Investment[];
  setInvestments: React.Dispatch<React.SetStateAction<Investment[]>>;
}

export const InvestmentsView: React.FC<InvestmentsViewProps> = ({
  investments,
  setInvestments,
}) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [monthly, setMonthly] = useState('');
  const [returns, setReturns] = useState('');
  const [fee, setFee] = useState('');
  const [provider, setProvider] = useState('');
  const [type, setType] = useState<Investment['type']>('study_fund');

  const totalPortfolioValue = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalMonthlyDeposits = investments.reduce((s, i) => s + (i.monthlyDeposit || 0), 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;
    const item: Investment = {
      id: `inv-${Date.now()}`,
      name,
      type,
      currentValue: parseFloat(value),
      monthlyDeposit: parseFloat(monthly) || 0,
      annualReturnPct: parseFloat(returns) || 7.0,
      managementFeePct: parseFloat(fee) || 0.6,
      provider: provider || 'בית השקעות ישראלי',
    };
    setInvestments((prev) => [...prev, item]);
    setName('');
    setValue('');
    setMonthly('');
    setReturns('');
    setFee('');
    setProvider('');
  };

  const handleDelete = (id: string) => {
    setInvestments((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D3436] dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#00B894]" />
            <span>תיק השקעות, פנסיה וחיסכון ארוך טווח</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            מעקב אחר קרנות השתלמות, קופות גמל, פנסיה, מניות ודמי ניהול
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">שווי תיק נכסים כולל</div>
          <div className="text-xl sm:text-2xl font-black text-[#2D3436] dark:text-white mt-1 font-mono">
            ₪{totalPortfolioValue.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">הפקדות חודשיות שוטפות</div>
          <div className="text-xl sm:text-2xl font-black text-[#00B894] mt-1 font-mono">
            ₪{totalMonthlyDeposits.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">דמי ניהול ממוצעים</div>
          <div className="text-xl sm:text-2xl font-black text-[#00B894] mt-1 font-mono">
            0.58% <span className="text-xs font-normal text-gray-400">מצבירה</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {investments.map((inv) => {
            const annualFeeEstimate = Math.round(inv.currentValue * (inv.managementFeePct / 100));

            return (
              <div
                key={inv.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF7F5] dark:bg-[#00B894]/20 flex items-center justify-center text-[#00B894]">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#2D3436] dark:text-white">
                        {inv.name}
                      </h3>
                      <div className="text-[11px] text-gray-400">
                        {inv.provider} • הפקדה: ₪{(inv.monthlyDeposit || 0).toLocaleString()}/חודש
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="text-base font-black font-mono text-[#2D3436] dark:text-white">
                        ₪{inv.currentValue.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#00B894] font-bold font-mono">
                        +{inv.annualReturnPct}% תשואה
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="text-gray-400 hover:text-[#FF7675] p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Management fee transparency badge */}
                <div className="pt-2 border-t border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span>דמי ניהול מצבירה:</span>
                    <span className="font-mono font-bold text-[#2D3436] dark:text-gray-300">
                      {inv.managementFeePct}%
                    </span>
                  </span>
                  <span className="text-[11px] text-[#D48806] dark:text-[#FDCB6E] font-medium">
                    עלות שנתית משוערת: ₪{annualFeeEstimate.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Investment Form */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs h-fit">
          <h3 className="text-sm font-bold text-[#2D3436] dark:text-white mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#00B894]" />
            <span>הוספת אפיק השקעה / פנסיה</span>
          </h3>

          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                שם האפיק
              </label>
              <input
                type="text"
                required
                placeholder="קרן השתלמות אלטשולר / S&P 500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  סוג
                </label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
                >
                  <option value="study_fund">קרן השתלמות</option>
                  <option value="pension">פנסיה</option>
                  <option value="provident_fund">קופת גמל</option>
                  <option value="stocks">שוק ההון / מניות</option>
                  <option value="real_estate">נדל״ן</option>
                  <option value="crypto">קריפטו</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  שווי נוכחי (₪)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="50000"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  הפקדה חודשית (₪)
                </label>
                <input
                  type="number"
                  placeholder="1500"
                  value={monthly}
                  onChange={(e) => setMonthly(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  דמי ניהול מצבירה (%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  placeholder="0.5"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                גוף מנהל
              </label>
              <input
                type="text"
                placeholder="מיטב / הראל / אינטראקטיב"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white font-bold transition-colors shadow-xs"
            >
              הוסף השקעה
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
