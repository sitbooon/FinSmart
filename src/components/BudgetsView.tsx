import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import { Budget, Category } from '../types';

interface BudgetsViewProps {
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  categories: Category[];
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  setBudgets,
  categories,
}) => {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editLimitAmount, setEditLimitAmount] = useState<string>('');
  const [newCatId, setNewCatId] = useState('');
  const [newCatLimit, setNewCatLimit] = useState('');

  const totalBudget = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spentSoFar, 0);
  const totalRemaining = Math.max(0, totalBudget - totalSpent);
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const handleStartEdit = (b: Budget) => {
    setEditingCategoryId(b.categoryId);
    setEditLimitAmount(String(b.monthlyLimit));
  };

  const handleSaveEdit = (categoryId: string) => {
    const val = parseFloat(editLimitAmount);
    if (!isNaN(val) && val > 0) {
      setBudgets((prev) =>
        prev.map((b) => (b.categoryId === categoryId ? { ...b, monthlyLimit: val } : b))
      );
    }
    setEditingCategoryId(null);
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId || !newCatLimit) return;
    const cat = categories.find((c) => c.id === newCatId);
    if (!cat) return;

    // Check if already exists
    if (budgets.some((b) => b.categoryId === newCatId)) {
      alert('כבר קיים תקציב לקטגוריה זו. ניתן לערוך את הסכום.');
      return;
    }

    const newB: Budget = {
      categoryId: newCatId,
      categoryName: cat.name,
      monthlyLimit: parseFloat(newCatLimit),
      spentSoFar: 0,
      projectedSpend: parseFloat(newCatLimit),
    };
    setBudgets((prev) => [...prev, newB]);
    setNewCatLimit('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D3436] dark:text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-[#00B894]" />
            <span>ניהול תקציבים ובקרת הוצאות</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            הגדרת גבולות הוצאה חודשיים לכל קטגוריה עם התרעות חריגה מוקדמות
          </p>
        </div>
      </div>

      {/* Overall Budget Progress Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-xs text-gray-400">סה״כ מסגרת תקציב חודשית</div>
            <div className="text-2xl sm:text-3xl font-black text-[#2D3436] dark:text-white mt-0.5">
              ₪{totalBudget.toLocaleString()}
            </div>
          </div>

          <div className="text-left">
            <div className="text-xs text-gray-400">הוצאה עד כה מול יתרה</div>
            <div className="text-lg font-bold text-[#2D3436] dark:text-white">
              <span className="font-mono">
                ₪{totalSpent.toLocaleString()}
              </span>{' '}
              <span className="text-xs font-normal text-gray-400">/ נותר ₪{totalRemaining.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Big Progress bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-gray-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage > 100
                  ? 'bg-[#FF7675]'
                  : overallPercentage > 85
                  ? 'bg-[#FDCB6E]'
                  : 'bg-[#00B894]'
              }`}
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>{overallPercentage}% נוצל מהתקציב הכולל</span>
            <span>
              {overallPercentage > 100
                ? 'חריגה מהתקציב הכולל!'
                : `נותרו עוד ₪${totalRemaining.toLocaleString()} להוצאה`}
            </span>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const pct = b.monthlyLimit > 0 ? Math.round((b.spentSoFar / b.monthlyLimit) * 100) : 0;
          const remaining = b.monthlyLimit - b.spentSoFar;
          const isOverBudget = b.spentSoFar > b.monthlyLimit;
          const isProjectedOver = b.projectedSpend > b.monthlyLimit && !isOverBudget;
          const isEditing = editingCategoryId === b.categoryId;

          return (
            <div
              key={b.categoryId}
              className={`p-5 rounded-2xl bg-white dark:bg-[#202728] border transition-all shadow-xs ${
                isOverBudget
                  ? 'border-[#FF7675] bg-rose-50/10'
                  : isProjectedOver
                  ? 'border-[#FDCB6E] bg-amber-50/10'
                  : 'border-[#E1E8E7] dark:border-[#2D3636]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#2D3436] dark:text-white">
                    {b.categoryName}
                  </h3>
                  {isOverBudget ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF7675] bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      חריגה בפועל
                    </span>
                  ) : isProjectedOver ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#D6A317] bg-[#FFF9EB] dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      צפויה חריגה
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[#00B894] bg-[#EBF7F5] dark:bg-[#00B894]/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      במסגרת
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editLimitAmount}
                      onChange={(e) => setEditLimitAmount(e.target.value)}
                      className="w-20 px-2 py-0.5 text-xs rounded border border-[#00B894] bg-white dark:bg-[#191D1E] text-[#2D3436] dark:text-white font-mono"
                    />
                    <button
                      onClick={() => handleSaveEdit(b.categoryId)}
                      className="px-2.5 py-1 bg-[#00B894] hover:bg-[#00A383] text-white rounded-lg text-xs font-bold"
                    >
                      שמור
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(b)}
                    className="text-gray-400 hover:text-[#2D3436] dark:hover:text-white p-1"
                    title="ערוך תקציב"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Numbers Row */}
              <div className="grid grid-cols-3 gap-2 py-2 text-xs border-y border-[#E1E8E7] dark:border-[#2D3636] mb-3">
                <div>
                  <div className="text-[10px] text-gray-400">תקציב שהוגדר</div>
                  <div className="font-mono font-bold text-[#2D3436] dark:text-white text-sm">
                    ₪{b.monthlyLimit.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">הוצאה בפועל</div>
                  <div
                    className={`font-mono font-bold text-sm ${
                      isOverBudget ? 'text-[#FF7675]' : 'text-[#2D3436] dark:text-white'
                    }`}
                  >
                    ₪{b.spentSoFar.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">
                    {remaining >= 0 ? 'יתרה לתקציב' : 'חריגה'}
                  </div>
                  <div
                    className={`font-mono font-bold text-sm ${
                      remaining >= 0 ? 'text-[#00B894]' : 'text-[#FF7675]'
                    }`}
                  >
                    {remaining < 0 ? '-' : ''}₪{Math.abs(remaining).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pct > 100
                        ? 'bg-[#FF7675]'
                        : pct > 85
                        ? 'bg-[#FDCB6E]'
                        : 'bg-[#00B894]'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span>{pct}% ניצול</span>
                  <span>
                    תחזית סוף חודש: ₪{b.projectedSpend.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Budget Category Form */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs max-w-xl">
        <h3 className="text-sm font-bold text-[#2D3436] dark:text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#00B894]" />
          <span>הגדרת תקציב לקטגוריה נוספת</span>
        </h3>

        <form onSubmit={handleAddBudget} className="flex flex-wrap gap-2 text-xs">
          <select
            value={newCatId}
            onChange={(e) => setNewCatId(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white"
          >
            <option value="">בחר קטגוריה...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="10"
            placeholder="סכום תקציב חודשי (₪)"
            value={newCatLimit}
            onChange={(e) => setNewCatLimit(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white"
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white font-bold transition-colors shadow-xs"
          >
            הוסף תקציב
          </button>
        </form>
      </div>
    </div>
  );
};
