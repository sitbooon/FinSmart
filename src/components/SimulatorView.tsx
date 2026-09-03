import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { FinancialSnapshot, DayForecast, SimulationScenario } from '../types';
import { runWhatIfSimulation } from '../utils/financeEngine';
import { CashflowChart } from './CashflowChart';

interface SimulatorViewProps {
  snapshot: FinancialSnapshot;
  forecast: DayForecast[];
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ snapshot, forecast }) => {
  const [scenarioType, setScenarioType] = useState<'expense' | 'income' | 'cancel_expense'>('expense');
  const [amount, setAmount] = useState<number>(4000);
  const [installments, setInstallments] = useState<number>(1);
  const [dayOfMonth, setDayOfMonth] = useState<number>(15);
  const [description, setDescription] = useState<string>('רכישת מחשב נייד חדש');

  // Run simulation calculation
  const scenario: SimulationScenario = {
    type: scenarioType,
    amount: amount || 0,
    installments: installments || 1,
    dayOfMonth: dayOfMonth || 15,
    description,
  };

  const simResult = runWhatIfSimulation(snapshot, forecast, scenario);

  // Quick preset buttons
  const applyPreset = (
    title: string,
    type: 'expense' | 'income' | 'cancel_expense',
    presetAmount: number,
    presetInst: number
  ) => {
    setDescription(title);
    setScenarioType(type);
    setAmount(presetAmount);
    setInstallments(presetInst);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D3436] dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#00B894]" />
            <span>סימולטור פיננסי: "מה יקרה אם?"</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            בדוק את ההשפעה המדויקת של החלטה כלכלית לפני ביצועה בפועל
          </p>
        </div>
      </div>

      {/* Preset Scenarios Quick Selector */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-400 font-bold self-center ml-2">
          תרחישים נפוצים:
        </span>
        <button
          onClick={() => applyPreset('קנייה חד-פעמית של ₪4,000 במזומן', 'expense', 4000, 1)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#202728] hover:bg-[#EBF7F5] dark:hover:bg-[#00B894]/20 border border-[#E1E8E7] dark:border-[#2D3636] text-[#2D3436] dark:text-gray-200 font-semibold transition-colors shadow-xs"
        >
          💻 קנייה ב-₪4,000 תשלום 1
        </button>
        <button
          onClick={() => applyPreset('חופשה משפחתית ב-₪6,000 ב-6 תשלומים', 'expense', 6000, 6)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#202728] hover:bg-[#EBF7F5] dark:hover:bg-[#00B894]/20 border border-[#E1E8E7] dark:border-[#2D3636] text-[#2D3436] dark:text-gray-200 font-semibold transition-colors shadow-xs"
        >
          ✈️ חופשה ב-₪6,000 ב-6 תשלומים
        </button>
        <button
          onClick={() => applyPreset('בונוס בלתי צפוי מהעבודה', 'income', 5000, 1)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#202728] hover:bg-[#EBF7F5] dark:hover:bg-[#00B894]/20 border border-[#E1E8E7] dark:border-[#2D3636] text-[#2D3436] dark:text-gray-200 font-semibold transition-colors shadow-xs"
        >
          🎁 בונוס של ₪5,000
        </button>
        <button
          onClick={() => applyPreset('ביטול מנויים וחסכון שוטף', 'cancel_expense', 600, 1)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#202728] hover:bg-[#EBF7F5] dark:hover:bg-[#00B894]/20 border border-[#E1E8E7] dark:border-[#2D3636] text-[#2D3436] dark:text-gray-200 font-semibold transition-colors shadow-xs"
        >
          ✂️ קיצוץ הוצאה של ₪600
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#2D3436] dark:text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#FDCB6E]" />
            <span>הגדרת התרחיש</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                תיאור הפעולה
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                סוג הפעולה
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#F4F7F6] dark:bg-[#191D1E] p-1 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636]">
                <button
                  type="button"
                  onClick={() => setScenarioType('expense')}
                  className={`py-1.5 rounded-lg font-bold transition-all ${
                    scenarioType === 'expense'
                      ? 'bg-[#FF7675] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  הוצאה חדשה
                </button>
                <button
                  type="button"
                  onClick={() => setScenarioType('income')}
                  className={`py-1.5 rounded-lg font-bold transition-all ${
                    scenarioType === 'income'
                      ? 'bg-[#00B894] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  הכנסה חדשה
                </button>
                <button
                  type="button"
                  onClick={() => setScenarioType('cancel_expense')}
                  className={`py-1.5 rounded-lg font-bold transition-all ${
                    scenarioType === 'cancel_expense'
                      ? 'bg-[#0984E3] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  ויתור על הוצאה
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-600 dark:text-gray-400 font-medium">
                  סכום כולל: <span className="font-black text-[#2D3436] dark:text-white font-mono">₪{amount.toLocaleString()}</span>
                </label>
              </div>
              <input
                type="range"
                min="100"
                max="30000"
                step="100"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-[#00B894]"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1 w-full px-3 py-1.5 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] font-mono text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
              />
            </div>

            {scenarioType === 'expense' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-gray-600 dark:text-gray-400 font-medium">
                    מספר תשלומים: <span className="font-bold text-[#2D3436] dark:text-white">{installments}</span>
                  </label>
                  <span className="text-[11px] text-gray-400 font-mono">
                    (₪{Math.round(amount / (installments || 1)).toLocaleString()} / חודש)
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 3, 6, 10, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setInstallments(num)}
                      className={`flex-1 py-1 rounded-lg font-bold transition-all border ${
                        installments === num
                          ? 'bg-[#00B894] border-[#00B894] text-white'
                          : 'bg-[#F4F7F6] dark:bg-[#191D1E] border-[#E1E8E7] dark:border-[#2D3636] text-[#2D3436] dark:text-gray-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                יום ביצוע החודש (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
              />
            </div>
          </div>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Verdict Card */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              simResult.causesOverdraft
                ? 'bg-[#FF7675]/10 border-[#FF7675]/30 text-[#FF7675]'
                : 'bg-[#EBF7F5] dark:bg-[#00B894]/10 border-[#00B894]/30'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  simResult.causesOverdraft
                    ? 'bg-[#FF7675]/20 text-[#FF7675]'
                    : 'bg-[#00B894]/20 text-[#00B894]'
                }`}
              >
                {simResult.causesOverdraft ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-[#2D3436] dark:text-white">
                  {simResult.causesOverdraft
                    ? 'זהירות: תרחיש זה מוביל למינוס!'
                    : 'התרחיש אפשרי ללא כניסה למינוס'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {simResult.recommendation}
                </p>
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#E1E8E7] dark:border-[#2D3636] text-xs">
              <div>
                <div className="text-gray-500 dark:text-gray-400">יתרה ללא השינוי</div>
                <div className="text-sm font-black font-mono text-[#2D3436] dark:text-white">
                  ₪{snapshot.projectedEndOfMonthBalance.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-gray-500 dark:text-gray-400">יתרה חדשה בסוף החודש</div>
                <div
                  className={`text-sm font-black font-mono ${
                    simResult.projectedBalanceNew >= 0 ? 'text-[#00B894]' : 'text-[#FF7675]'
                  }`}
                >
                  ₪{simResult.projectedBalanceNew.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-gray-500 dark:text-gray-400">השפעה ישירה החודש</div>
                <div
                  className={`text-sm font-black font-mono ${
                    simResult.difference >= 0 ? 'text-[#00B894]' : 'text-[#FF7675]'
                  }`}
                >
                  {simResult.difference >= 0 ? '+' : ''}₪{simResult.difference.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Cashflow Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              השוואת עקומת התזרים: תרחיש נוכחי מול תרחיש סימולציה
            </h3>
            <CashflowChart
              forecast={forecast}
              comparisonForecast={simResult.simulatedForecast}
              comparisonLabel="תרחיש הסימולציה"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
