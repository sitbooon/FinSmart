import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
  CheckCircle,
  CreditCard as CardIcon,
  HelpCircle,
} from 'lucide-react';
import {
  FinancialSnapshot,
  DayForecast,
  FixedExpense,
  ExpectedIncome,
  CreditCard,
} from '../types';
import { CashflowChart } from './CashflowChart';

interface CashflowViewProps {
  snapshot: FinancialSnapshot;
  forecast: DayForecast[];
  fixedExpenses: FixedExpense[];
  setFixedExpenses: React.Dispatch<React.SetStateAction<FixedExpense[]>>;
  expectedIncomes: ExpectedIncome[];
  setExpectedIncomes: React.Dispatch<React.SetStateAction<ExpectedIncome[]>>;
  creditCards: CreditCard[];
}

export const CashflowView: React.FC<CashflowViewProps> = ({
  snapshot,
  forecast,
  fixedExpenses,
  setFixedExpenses,
  expectedIncomes,
  setExpectedIncomes,
  creditCards,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'fixed' | 'incomes'>('timeline');

  // Modal / form states for adding fixed expense or income
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDay, setNewExpenseDay] = useState('10');
  const [newExpenseCategory, setNewExpenseCategory] = useState('בית ודיור');

  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeDay, setNewIncomeDay] = useState('1');
  const [newIncomeKind, setNewIncomeKind] = useState<'salary' | 'business' | 'recurring' | 'one_time'>('salary');

  const handleAddFixedExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseAmount) return;
    const item: FixedExpense = {
      id: `fix-${Date.now()}`,
      name: newExpenseName,
      amount: parseFloat(newExpenseAmount),
      dayOfMonth: parseInt(newExpenseDay) || 1,
      category: newExpenseCategory,
      isPaidThisMonth: false,
    };
    setFixedExpenses((prev) => [...prev, item]);
    setNewExpenseName('');
    setNewExpenseAmount('');
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncomeName || !newIncomeAmount) return;
    const item: ExpectedIncome = {
      id: `inc-${Date.now()}`,
      name: newIncomeName,
      amount: parseFloat(newIncomeAmount),
      dayOfMonth: parseInt(newIncomeDay) || 1,
      kind: newIncomeKind,
      isReceivedThisMonth: false,
    };
    setExpectedIncomes((prev) => [...prev, item]);
    setNewIncomeName('');
    setNewIncomeAmount('');
  };

  const toggleExpensePaid = (id: string) => {
    setFixedExpenses((prev) =>
      prev.map((fe) => (fe.id === id ? { ...fe, isPaidThisMonth: !fe.isPaidThisMonth } : fe))
    );
  };

  const toggleIncomeReceived = (id: string) => {
    setExpectedIncomes((prev) =>
      prev.map((inc) =>
        inc.id === id ? { ...inc, isReceivedThisMonth: !inc.isReceivedThisMonth } : inc
      )
    );
  };

  const deleteFixedExpense = (id: string) => {
    setFixedExpenses((prev) => prev.filter((fe) => fe.id !== id));
  };

  const deleteIncome = (id: string) => {
    setExpectedIncomes((prev) => prev.filter((inc) => inc.id !== id));
  };

  const totalMonthlyFixed = fixedExpenses.reduce((s, fe) => s + fe.amount, 0);
  const totalMonthlyIncomes = expectedIncomes.reduce((s, inc) => s + inc.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D3436] dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#00B894]" />
            <span>מערכת תזרים מתקדמת</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            תחזית יתרה יומית המחשבת הכנסות צפויות, חיובי אשראי והוצאות קבועות
          </p>
        </div>

        {/* Navigation pills */}
        <div className="flex items-center bg-[#F4F7F6] dark:bg-[#191D1E] p-1 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] text-xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'timeline'
                ? 'bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#2D3436]'
            }`}
          >
            תחזית יומית
          </button>
          <button
            onClick={() => setActiveTab('fixed')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'fixed'
                ? 'bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#2D3436]'
            }`}
          >
            הוצאות קבועות ({fixedExpenses.length})
          </button>
          <button
            onClick={() => setActiveTab('incomes')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'incomes'
                ? 'bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#2D3436]'
            }`}
          >
            הכנסות צפויות ({expectedIncomes.length})
          </button>
        </div>
      </div>

      {/* Top 3 Formula Summary Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x-reverse divide-x divide-[#E1E8E7] dark:divide-[#2D3636]">
          <div>
            <div className="text-[11px] text-gray-400">יתרה נוכחית</div>
            <div className="text-lg font-extrabold text-[#2D3436] dark:text-white">
              ₪{snapshot.currentCheckingBalance.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#00B894] font-bold">
              + הכנסות שנותרו
            </div>
            <div className="text-lg font-extrabold text-[#00B894]">
              ₪{snapshot.pendingIncomesThisMonth.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#FF7675] font-bold">- הוצאות קבועות & אשראי</div>
            <div className="text-lg font-extrabold text-[#FF7675]">
              ₪{(snapshot.pendingFixedExpenses + snapshot.upcomingCreditCardBills).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#0984E3] font-bold">
              = כסף פנוי אמיתי
            </div>
            <div className="text-lg font-extrabold text-[#0984E3]">
              ₪{snapshot.realAvailableMoney.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Main Chart */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
            <h2 className="text-sm font-bold text-[#2D3436] dark:text-white mb-2">
              גרף יתרת תזרים צפויה לאורך הזמן
            </h2>
            <CashflowChart forecast={forecast} />
          </div>

          {/* Daily Projection Breakdown Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
            <h2 className="text-sm font-bold text-[#2D3436] dark:text-white mb-4 flex items-center justify-between">
              <span>לוח זמנים תזרימי יומי עד סוף החודש</span>
              <span className="text-xs text-gray-400 font-normal">
                מחושב עם הוצאה יומית מתונה של כ-₪110
              </span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#F4F7F6] dark:bg-[#191D1E] text-gray-500 dark:text-gray-400 border-b border-[#E1E8E7] dark:border-[#2D3636]">
                  <tr>
                    <th className="py-2.5 px-3">תאריך</th>
                    <th className="py-2.5 px-3">אירועים וחיובים ביום זה</th>
                    <th className="py-2.5 px-3">שינוי יומי נטו</th>
                    <th className="py-2.5 px-3">יתרה צפויה בסוף היום</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E8E7] dark:divide-[#2D3636]">
                  {forecast.map((f) => (
                    <tr
                      key={f.day}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        f.events.length > 0 ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        יום {f.dateStr}
                      </td>
                      <td className="py-2.5 px-3">
                        {f.events.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {f.events.map((ev, i) => (
                              <span
                                key={i}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                                  ev.type === 'income'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                              >
                                <span>{ev.name}:</span>
                                <span className="font-mono font-bold">
                                  {ev.type === 'income' ? '+' : '-'}₪{ev.amount.toLocaleString()}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">שגרה שוטפת</span>
                        )}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-mono font-bold ${
                          f.netDayChange >= 0 ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {f.netDayChange >= 0 ? '+' : ''}₪{f.netDayChange.toLocaleString()}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-mono font-black ${
                          f.projectedBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        ₪{f.projectedBalance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Expenses Tab */}
      {activeTab === 'fixed' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    סה״כ הוצאות קבועות החודש:{' '}
                    <span className="text-rose-600 font-mono">
                      ₪{totalMonthlyFixed.toLocaleString()}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    הוצאות החוזרות מדי חודש (משכנתא, ארנונה, ביטוחים, מנויים)
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {fixedExpenses.map((fe) => (
                  <div
                    key={fe.id}
                    className="py-3 flex items-center justify-between text-xs gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => toggleExpensePaid(fe.id)}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          fe.isPaidThisMonth
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                        }`}
                        title={fe.isPaidThisMonth ? 'שולם החודש (לחץ לביטול)' : 'סמן כשולם'}
                      >
                        {fe.isPaidThisMonth && <CheckCircle className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <div
                          className={`font-semibold text-slate-900 dark:text-white ${
                            fe.isPaidThisMonth ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {fe.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{fe.category}</span>
                          <span>•</span>
                          <span>ב-{fe.dayOfMonth} לחודש</span>
                          {fe.isPaidThisMonth && (
                            <span className="text-emerald-600 font-semibold">• שולם החודש</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        ₪{fe.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteFixedExpense(fe.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded"
                        title="מחק"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Fixed Expense Form */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs h-fit">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>הוספת הוצאה קבועה</span>
              </h3>

              <form onSubmit={handleAddFixedExpense} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    שם ההוצאה הקבועה
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="לדוגמה: ארנונה / ביטוח מקיף"
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    סכום חודשי (₪)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="500"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      יום בחודש (1-31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={newExpenseDay}
                      onChange={(e) => setNewExpenseDay(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      קטגוריה
                    </label>
                    <select
                      value={newExpenseCategory}
                      onChange={(e) => setNewExpenseCategory(e.target.value)}
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="בית ודיור">בית ודיור</option>
                      <option value="ביטוחים">ביטוחים</option>
                      <option value="מנויים ותקשורת">מנויים</option>
                      <option value="הלוואות ומשכנתא">הלוואה/משכנתא</option>
                      <option value="ילדים וחינוך">ילדים וחינוך</option>
                      <option value="אחר">אחר</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-xs"
                >
                  הוסף לתזרים
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Expected Incomes Tab */}
      {activeTab === 'incomes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    סה״כ הכנסות צפויות החודש:{' '}
                    <span className="text-emerald-600 font-mono">
                      ₪{totalMonthlyIncomes.toLocaleString()}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    משכורות, קצבאות, הכנסות מעסק או תשלומים חד-פעמיים
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {expectedIncomes.map((inc) => (
                  <div
                    key={inc.id}
                    className="py-3 flex items-center justify-between text-xs gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => toggleIncomeReceived(inc.id)}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          inc.isReceivedThisMonth
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                        }`}
                        title={inc.isReceivedThisMonth ? 'התקבלה החודש' : 'סמן כהתקבלה'}
                      >
                        {inc.isReceivedThisMonth && <CheckCircle className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <div
                          className={`font-semibold text-slate-900 dark:text-white ${
                            inc.isReceivedThisMonth ? 'text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {inc.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>
                            {inc.kind === 'salary'
                              ? 'משכורת קבועה'
                              : inc.kind === 'business'
                              ? 'הכנסת עסק'
                              : inc.kind === 'recurring'
                              ? 'קצבה / קבועה'
                              : 'חד-פעמית'}
                          </span>
                          <span>•</span>
                          <span>ב-{inc.dayOfMonth} לחודש</span>
                          {inc.isReceivedThisMonth && (
                            <span className="text-emerald-600 font-semibold">• התקבלה בחשבון</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-emerald-600">
                        +₪{inc.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteIncome(inc.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded"
                        title="מחק"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Income Form */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs h-fit">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>הוספת הכנסה צפויה</span>
              </h3>

              <form onSubmit={handleAddIncome} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    שם ההכנסה
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="לדוגמה: משכורת / החזר מס / פרילנס"
                    value={newIncomeName}
                    onChange={(e) => setNewIncomeName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    סכום צפוי (₪)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="10000"
                    value={newIncomeAmount}
                    onChange={(e) => setNewIncomeAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      יום בחודש (1-31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={newIncomeDay}
                      onChange={(e) => setNewIncomeDay(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      סוג הכנסה
                    </label>
                    <select
                      value={newIncomeKind}
                      onChange={(e: any) => setNewIncomeKind(e.target.value)}
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="salary">משכורת</option>
                      <option value="business">עסק / עצמאי</option>
                      <option value="recurring">קצבה / קבועה</option>
                      <option value="one_time">חד-פעמית</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-xs"
                >
                  הוסף הכנסה לתזרים
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
