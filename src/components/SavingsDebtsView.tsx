import React, { useState } from 'react';
import {
  PiggyBank,
  Shield,
  Target,
  Plus,
  Trash2,
  TrendingUp,
  AlertCircle,
  Flame,
  Snowflake,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { SavingGoal, Debt } from '../types';

interface SavingsDebtsViewProps {
  savingGoals: SavingGoal[];
  setSavingGoals: React.Dispatch<React.SetStateAction<SavingGoal[]>>;
  debts: Debt[];
  setDebts: React.Dispatch<React.SetStateAction<Debt[]>>;
}

export const SavingsDebtsView: React.FC<SavingsDebtsViewProps> = ({
  savingGoals,
  setSavingGoals,
  debts,
  setDebts,
}) => {
  const [activeTab, setActiveTab] = useState<'savings' | 'debts'>('savings');
  const [debtStrategy, setDebtStrategy] = useState<'avalanche' | 'snowball'>('avalanche');

  // New Goal State
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalMonthly, setGoalMonthly] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalCategory, setGoalCategory] = useState<'emergency' | 'vacation' | 'car' | 'home' | 'custom'>('emergency');

  // New Debt State
  const [debtName, setDebtName] = useState('');
  const [debtBalance, setDebtBalance] = useState('');
  const [debtInterest, setDebtInterest] = useState('');
  const [debtMonthly, setDebtMonthly] = useState('');
  const [debtType, setDebtType] = useState<'mortgage' | 'car_loan' | 'bank_loan' | 'other'>('bank_loan');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;
    const newG: SavingGoal = {
      id: `goal-${Date.now()}`,
      name: goalName,
      targetAmount: parseFloat(goalTarget),
      currentAmount: parseFloat(goalCurrent) || 0,
      monthlyDeposit: parseFloat(goalMonthly) || 500,
      targetDate: goalDate || '2027-01-01',
      category: goalCategory,
    };
    setSavingGoals((prev) => [...prev, newG]);
    setGoalName('');
    setGoalTarget('');
    setGoalCurrent('');
    setGoalMonthly('');
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtName || !debtBalance) return;
    const newD: Debt = {
      id: `debt-${Date.now()}`,
      name: debtName,
      originalAmount: parseFloat(debtBalance),
      currentBalance: parseFloat(debtBalance),
      interestRate: parseFloat(debtInterest) || 5.0,
      monthlyPayment: parseFloat(debtMonthly) || 1000,
      endDate: '2028-12-31',
      type: debtType,
    };
    setDebts((prev) => [...prev, newD]);
    setDebtName('');
    setDebtBalance('');
    setDebtInterest('');
    setDebtMonthly('');
  };

  const deleteGoal = (id: string) => {
    setSavingGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const totalSaved = savingGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalGoalTarget = savingGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalDebtBalance = debts.reduce((s, d) => s + d.currentBalance, 0);
  const totalMonthlyDebtRepayment = debts.reduce((s, d) => s + d.monthlyPayment, 0);

  // Sort debts based on strategy
  const sortedDebts = [...debts].sort((a, b) => {
    if (debtStrategy === 'avalanche') {
      // Highest interest rate first
      return b.interestRate - a.interestRate;
    } else {
      // Smallest balance first (Snowball)
      return a.currentBalance - b.currentBalance;
    }
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D3436] dark:text-white flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-[#00B894]" />
            <span>יעדי חיסכון וניהול חובות</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            מעקב צבירת קרן חירום ויעדים לצד אסטרטגיות סילוק חובות ומשכנתא
          </p>
        </div>

        <div className="flex items-center bg-[#F4F7F6] dark:bg-[#191D1E] p-1 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-3.5 py-1.5 rounded-lg transition-all font-bold ${
              activeTab === 'savings'
                ? 'bg-white dark:bg-[#202728] text-[#2D3436] dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-[#2D3436]'
            }`}
          >
            יעדי חיסכון ({savingGoals.length})
          </button>
          <button
            onClick={() => setActiveTab('debts')}
            className={`px-3.5 py-1.5 rounded-lg transition-all font-bold ${
              activeTab === 'debts'
                ? 'bg-white dark:bg-[#202728] text-[#2D3436] dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-[#2D3436]'
            }`}
          >
            הלוואות וחובות ({debts.length})
          </button>
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">סה״כ נצבר ביעדי חיסכון</div>
          <div className="text-xl sm:text-2xl font-black text-[#00B894] mt-1 font-mono">
            ₪{totalSaved.toLocaleString()}{' '}
            <span className="text-xs font-normal text-gray-400">
              / יעד ₪{totalGoalTarget.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">יתרת חובות ומשכנתאות</div>
          <div className="text-xl sm:text-2xl font-black text-[#2D3436] dark:text-white mt-1 font-mono">
            ₪{totalDebtBalance.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">החזר חודשי כולל על חובות</div>
          <div className="text-xl sm:text-2xl font-black text-[#FF7675] mt-1 font-mono">
            ₪{totalMonthlyDebtRepayment.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Savings Goals Tab */}
      {activeTab === 'savings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {savingGoals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              const remainingMonths =
                g.monthlyDeposit > 0
                  ? Math.ceil((g.targetAmount - g.currentAmount) / g.monthlyDeposit)
                  : 0;

              return (
                <div
                  key={g.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#EBF7F5] dark:bg-[#00B894]/20 flex items-center justify-center text-[#00B894]">
                        {g.category === 'emergency' ? (
                          <Shield className="w-5 h-5" />
                        ) : (
                          <Target className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#2D3436] dark:text-white">
                          {g.name}
                        </h3>
                        <div className="text-[11px] text-gray-400">
                          הפקדה חודשית: ₪{g.monthlyDeposit.toLocaleString()} • תאריך יעד: {g.targetDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className="text-sm font-black font-mono text-[#00B894]">
                          ₪{g.currentAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          מתוך ₪{g.targetAmount.toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteGoal(g.id)}
                        className="text-gray-400 hover:text-[#FF7675] p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-[#F4F7F6] dark:bg-[#191D1E] h-2.5 rounded-full overflow-hidden border border-[#E1E8E7]/50 dark:border-[#2D3636]/50">
                      <div
                        className="bg-[#00B894] h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      <span>{pct}% מהיעד הושלם</span>
                      <span>
                        {pct >= 100
                          ? '🎉 היעד הושג במלואו!'
                          : `עוד כ-${remainingMonths} חודשים בקצב הנוכחי`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Goal Form */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs h-fit">
            <h3 className="text-sm font-bold text-[#2D3436] dark:text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00B894]" />
              <span>הגדרת יעד חיסכון חדש</span>
            </h3>

            <form onSubmit={handleAddGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  שם היעד
                </label>
                <input
                  type="text"
                  required
                  placeholder="קרן חירום / חופשה ביפן"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    סכום יעד (₪)
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="30000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    נצבר כרגע (₪)
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
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
                    placeholder="1000"
                    value={goalMonthly}
                    onChange={(e) => setGoalMonthly(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    סוג יעד
                  </label>
                  <select
                    value={goalCategory}
                    onChange={(e: any) => setGoalCategory(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                  >
                    <option value="emergency">קרן חירום</option>
                    <option value="vacation">חופשה</option>
                    <option value="car">רכב</option>
                    <option value="home">שיפוץ / בית</option>
                    <option value="custom">יעד חופשי</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  תאריך יעד משוער
                </label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white font-bold transition-colors shadow-xs"
              >
                שמור יעד
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Debts & Loans Tab */}
      {activeTab === 'debts' && (
        <div className="space-y-6">
          {/* Strategy Selector (Snowball vs Avalanche) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#2D3436] dark:text-white">
                אסטרטגיית סילוק חובות מומלצת
              </div>
              <div className="text-[11px] text-gray-400">
                {debtStrategy === 'avalanche'
                  ? 'מפולת שלגים (Avalanche): עדיפות לריבית הגבוהה ביותר - חוסך הכי הרבה כסף'
                  : 'כדור שלג (Snowball): עדיפות ליתרה הקטנה ביותר - תורם למוטיבציה מהירה'}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDebtStrategy('avalanche')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  debtStrategy === 'avalanche'
                    ? 'bg-[#00B894] border-[#00B894] text-white shadow-xs'
                    : 'bg-[#F4F7F6] dark:bg-[#191D1E] border-[#E1E8E7] dark:border-[#2D3636] text-[#2D3436] dark:text-gray-400'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>מפולת שלגים (חיסכון בריבית)</span>
              </button>

              <button
                onClick={() => setDebtStrategy('snowball')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  debtStrategy === 'snowball'
                    ? 'bg-[#00B894] border-[#00B894] text-white shadow-xs'
                    : 'bg-[#F4F7F6] dark:bg-[#191D1E] border-[#E1E8E7] dark:border-[#2D3636] text-[#2D3436] dark:text-gray-400'
                }`}
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>כדור שלג (סגירה מהירה)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {sortedDebts.map((d, idx) => (
                <div
                  key={d.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-gray-300 font-mono font-bold text-xs flex items-center justify-center border border-[#E1E8E7] dark:border-[#2D3636]">
                        #{idx + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-[#2D3436] dark:text-white">
                          {d.name}
                        </h3>
                        <div className="text-[11px] text-gray-400">
                          ריבית שנתית: <span className="font-bold text-[#FF7675] font-mono">{d.interestRate}%</span> • החזר חודשי: ₪{d.monthlyPayment.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className="text-sm font-black font-mono text-[#2D3436] dark:text-white">
                          ₪{d.currentBalance.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-400">יתרה לסילוק</div>
                      </div>

                      <button
                        onClick={() => deleteDebt(d.id)}
                        className="text-gray-400 hover:text-[#FF7675] p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Debt Form */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs h-fit">
              <h3 className="text-sm font-bold text-[#2D3436] dark:text-white mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00B894]" />
                <span>הוספת הלוואה / חוב</span>
              </h3>

              <form onSubmit={handleAddDebt} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    שם ההלוואה / חוב
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="משכנתא / הלוואת רכב"
                    value={debtName}
                    onChange={(e) => setDebtName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                      יתרה לסילוק (₪)
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      placeholder="45000"
                      value={debtBalance}
                      onChange={(e) => setDebtBalance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                      ריבית שנתית (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="6.5"
                      value={debtInterest}
                      onChange={(e) => setDebtInterest(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    החזר חודשי (₪)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="1200"
                    value={debtMonthly}
                    onChange={(e) => setDebtMonthly(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white font-bold transition-colors shadow-xs"
                >
                  הוסף חוב
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
