import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard as CreditCardIcon,
  Sparkles,
  AlertCircle,
  TrendingUp,
  HelpCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Zap,
  Plus,
  Database,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Edit3,
} from 'lucide-react';
import {
  FinancialSnapshot,
  DayForecast,
  Transaction,
  AnomalyAlert,
  MonthSummary,
} from '../types';
import { CashflowChart } from './CashflowChart';
import { MonthlyBreakdownBar } from './MonthlyBreakdownBar';

interface DashboardViewProps {
  snapshot: FinancialSnapshot;
  forecast: DayForecast[];
  transactions: Transaction[];
  alerts: AnomalyAlert[];
  onNavigate: (tab: any) => void;
  onOpenAddModal: () => void;
  aiInsights: Array<{
    id: string;
    title: string;
    text: string;
    category: string;
    badge: string;
    type: string;
  }>;
  onAskAi: (prompt: string) => void;
  isDemoMode?: boolean;
  onOpenCsvModal?: () => void;
  onOpenDataModal?: () => void;
  selectedMonth?: string;
  onSelectMonth?: (monthKey: string) => void;
  monthlySummaries?: MonthSummary[];
  onOpenQuickBalance?: () => void;
  onOpenAvailableMoneyExplainer?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  snapshot,
  forecast,
  transactions,
  alerts,
  onNavigate,
  onOpenAddModal,
  aiInsights,
  onAskAi,
  isDemoMode = false,
  onOpenCsvModal,
  onOpenDataModal,
  selectedMonth,
  onSelectMonth,
  monthlySummaries = [],
  onOpenQuickBalance,
  onOpenAvailableMoneyExplainer,
}) => {
  const recentTransactions = transactions.slice(0, 5);
  const featuredInsight = aiInsights[0] || {
    title: 'תובנה פיננסית',
    text: 'שמירה על מעקב שבועי של תנועות העו״ש והאשראי מונעת הפתעות בסוף החודש ושומרת על כסף פנוי חיובי.',
  };

  const todayHebrewDate = new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="space-y-6 pb-12">
      {/* Friendly, Airy Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-[#1E2526] p-4 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-[#2D3636] shadow-2xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              שלום! תמונת המצב שלך
            </h2>
            <span className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/40">
              {todayHebrewDate}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
            {snapshot.isPastMonth
              ? 'סיכום נתוני חודש קודם – כל ההכנסות וההוצאות שנסגרו'
              : 'ניהול שוטף של הכסף הפנוי, החשבונות והתחייבויות האשראי'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                snapshot.monthStatus === 'good'
                  ? 'bg-emerald-500'
                  : snapshot.monthStatus === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-rose-500 animate-pulse'
              }`}
            ></span>
            <span className="font-bold text-gray-800 dark:text-slate-100 text-[11px] sm:text-xs">
              {snapshot.monthStatus === 'good'
                ? 'החודש במסלול יציב'
                : snapshot.monthStatus === 'warning'
                ? 'דורש תשומת לב'
                : 'צפוי גירעון'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-[#252D2E] rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
            <span className="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs">ציון בריאות:</span>
            <span className="font-extrabold text-[#00B894] font-mono text-xs sm:text-sm">
              {snapshot.financialScore}/100
            </span>
          </div>
        </div>
      </header>

      {/* Clean Slate Onboarding (shown only when 0 transactions exist) */}
      {transactions.length === 0 && (
        <div className="bg-white dark:bg-[#1E2526] border border-gray-200/80 dark:border-[#2D3636] rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-xs mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>מערכת נקייה ומוכנה לשימוש</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                איך מתחילים בכמה שניות?
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-xl leading-relaxed">
                מומלץ להגדיר את יתרת העו״ש או לייבא קובץ אקסל/CSV שהורדת מאתר הבנק שלך. הנתונים נשמרים אצלך בדפדפן באופן פרטי ומאובטח.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenQuickBalance || (() => onNavigate('accounts'))}
                className="px-3.5 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white text-xs font-bold transition-all shadow-xs"
              >
                1. הגדרת יתרת עו״ש
              </button>
              {onOpenCsvModal && (
                <button
                  onClick={onOpenCsvModal}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#202728] hover:bg-gray-50 dark:hover:bg-[#252D2E] text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-all shadow-2xs"
                >
                  2. ייבוא קובץ מהבנק (Excel/CSV)
                </button>
              )}
              <button
                onClick={onOpenAddModal}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#202728] hover:bg-gray-50 dark:hover:bg-[#252D2E] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-xs font-semibold transition-all shadow-2xs"
              >
                3. הוספת תנועה ידנית
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Breakdown Comparison Strip */}
      {monthlySummaries.length > 0 && selectedMonth && onSelectMonth && (
        <MonthlyBreakdownBar
          monthlySummaries={monthlySummaries}
          selectedMonth={selectedMonth}
          onSelectMonth={onSelectMonth}
        />
      )}

      {/* Accessible Quick Action Buttons Strip */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          onClick={onOpenAddModal}
          className="flex flex-col sm:flex-row items-center sm:items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#1E2526] hover:bg-emerald-50/50 dark:hover:bg-[#252D2E] border border-gray-200/80 dark:border-[#2D3636] hover:border-[#00B894]/40 text-gray-800 dark:text-gray-200 transition-all shadow-2xs group text-center sm:text-right"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[#00B894] group-hover:scale-110 transition-transform shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] sm:text-xs font-bold text-gray-900 dark:text-white leading-tight">הוספת תנועה</div>
            <div className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400">הכנסה או הוצאה</div>
          </div>
        </button>

        {onOpenCsvModal && (
          <button
            onClick={onOpenCsvModal}
            className="flex flex-col sm:flex-row items-center sm:items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#1E2526] hover:bg-emerald-50/50 dark:hover:bg-[#252D2E] border border-gray-200/80 dark:border-[#2D3636] hover:border-[#00B894]/40 text-gray-800 dark:text-gray-200 transition-all shadow-2xs group text-center sm:text-right"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs font-bold text-gray-900 dark:text-white leading-tight">ייבוא מהבנק</div>
              <div className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400">קובץ Excel או CSV</div>
            </div>
          </button>
        )}

        {onOpenQuickBalance && !snapshot.isPastMonth && (
          <button
            onClick={onOpenQuickBalance}
            className="flex flex-col sm:flex-row items-center sm:items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-[#1E2526] hover:bg-emerald-50/50 dark:hover:bg-[#252D2E] border border-gray-200/80 dark:border-[#2D3636] hover:border-[#00B894]/40 text-gray-800 dark:text-gray-200 transition-all shadow-2xs group text-center sm:text-right"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs font-bold text-gray-900 dark:text-white leading-tight">עדכון עו״ש</div>
              <div className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400">התאמת יתרה מהירה</div>
            </div>
          </button>
        )}
      </div>

      {/* Primary Top 3 Metric Cards – Clear, Spacious, and Accessible */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
        {/* Card 1: כסף פנוי אמיתי */}
        <div className="bg-white dark:bg-[#1E2526] p-4 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-[#2D3636] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <Wallet className="w-4 h-4 text-[#00B894]" />
                <span>{snapshot.isPastMonth ? 'מאזן חודשי נטו' : 'כסף פנוי אמיתי'}</span>
              </div>
              {onOpenAvailableMoneyExplainer && (
                <button
                  onClick={onOpenAvailableMoneyExplainer}
                  className="p-1 rounded-lg text-gray-400 hover:text-[#00B894] hover:bg-gray-100 dark:hover:bg-[#252D2E] transition-colors"
                  title="איך מחושב הכסף הפנוי?"
                  aria-label="הסבר על חישוב כסף פנוי"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1 font-mono">
              {snapshot.isPastMonth ? (
                <span className={snapshot.actualMonthIncome - snapshot.actualMonthExpenses >= 0 ? 'text-[#00B894]' : 'text-rose-500'}>
                  {snapshot.actualMonthIncome - snapshot.actualMonthExpenses >= 0 ? '+' : ''}
                  ₪{(snapshot.actualMonthIncome - snapshot.actualMonthExpenses).toLocaleString()}
                </span>
              ) : (
                <span className={snapshot.realAvailableMoney >= 0 ? 'text-[#00B894]' : 'text-rose-500'}>
                  ₪{snapshot.realAvailableMoney.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
              {snapshot.isPastMonth ? (
                <span>
                  הכנסות: ₪{snapshot.actualMonthIncome.toLocaleString()} | הוצאות: ₪{snapshot.actualMonthExpenses.toLocaleString()}
                </span>
              ) : (
                <span>הסכום שנשאר לך חופשי לשימוש לאחר שריון חיובי האשראי והקבועות שטרם ירדו.</span>
              )}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 dark:border-[#2D3636] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>יתרה נוכחית בעו״ש:</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                ₪{snapshot.currentCheckingBalance.toLocaleString()}
              </span>
              {onOpenQuickBalance && !snapshot.isPastMonth && (
                <button
                  onClick={onOpenQuickBalance}
                  className="text-xs font-bold text-[#00B894] hover:underline"
                >
                  עדכן
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: תחזית לסוף חודש */}
        <div className="bg-white dark:bg-[#1E2526] p-4 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-[#2D3636] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-sky-500" />
                <span>תחזית לסוף חודש</span>
              </div>
              <button
                onClick={() => onNavigate('cashflow')}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5"
              >
                <span>לוח תזרים</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 font-mono ${
                snapshot.projectedEndOfMonthBalance >= 0
                  ? 'text-gray-900 dark:text-white'
                  : 'text-rose-500'
              }`}
            >
              ₪{snapshot.projectedEndOfMonthBalance.toLocaleString()}
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
              {snapshot.statusExplanation}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 dark:border-[#2D3636] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>מומלץ להוצאה היום:</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm">
              ₪{snapshot.dailyRecommendedBudget}
            </span>
          </div>
        </div>

        {/* Card 3: התחייבויות שטרם ירדו (קליל ונעים, ללא גוש שחור) */}
        <div className="bg-white dark:bg-[#1E2526] p-4 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-[#2D3636] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <CreditCardIcon className="w-4 h-4 text-amber-500" />
                <span>התחייבויות שטרם ירדו</span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                צפוי החודש
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1 font-mono">
              ₪{(snapshot.upcomingCreditCardBills + snapshot.pendingFixedExpenses).toLocaleString()}
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
              סכומים משוריינים שיורדים אוטומטית בהמשך החודש ולא נחשבים כסף פנוי.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 dark:border-[#2D3636] flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>אשראי: ₪{snapshot.upcomingCreditCardBills.toLocaleString()}</span>
            <span>קבועות: ₪{snapshot.pendingFixedExpenses.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Anomaly Alerts if any */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-4 rounded-2xl border text-xs sm:text-sm font-medium ${
                alert.severity === 'danger'
                  ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                  : alert.severity === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800/40 dark:text-amber-200'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-[#00B894]/10 dark:border-[#00B894]/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold ml-1.5">{alert.title}:</span>
                  <span>{alert.message}</span>
                </div>
              </div>
              <button
                onClick={() => onAskAi(`מה לעשות לגבי ההתראה: ${alert.title}?`)}
                className="shrink-0 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#202728] text-xs font-bold shadow-2xs hover:bg-gray-50 transition-colors"
              >
                התייעץ עם AI
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Section: Cashflow Chart + Budget Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cashflow Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E2526] p-4 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-[#2D3636] shadow-2xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-[#00B894]" />
                <span>תזרים מזומנים יומי צפוי</span>
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                תחזית יתרת העו״ש לאורך ימי החודש בהתאם למועדי המשכורות והחיובים
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">הכנסות</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">הוצאות</span>
              </div>
              <button
                onClick={() => onNavigate('cashflow')}
                className="text-xs font-bold text-[#00B894] hover:underline flex items-center gap-0.5 mr-2"
              >
                <span>פירוט מלא</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="py-2">
            <CashflowChart forecast={forecast} />
          </div>
        </div>

        {/* Right: Budget Status (1 Col) */}
        <div className="bg-white dark:bg-[#1E2526] p-4 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-[#2D3636] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900 dark:text-white text-base">תקציב לפי קטגוריות</h4>
              <button
                onClick={() => onNavigate('budgets')}
                className="text-xs text-[#00B894] font-bold hover:underline"
              >
                ניהול תקציבים
              </button>
            </div>

            {snapshot.topExpenseCategories.length > 0 ? (
              <div className="space-y-4">
                {snapshot.topExpenseCategories.slice(0, 4).map((item) => {
                  const maxCat = snapshot.monthExpenseActual || 1;
                  const pct = Math.min(100, Math.round((item.amount / maxCat) * 100));
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-700 dark:text-gray-200">
                        <span>{item.category}</span>
                        <span className="font-bold font-mono">₪{item.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#00B894] h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">
                <p>טרם נרשמו הוצאות החודש.</p>
                <button
                  onClick={onOpenAddModal}
                  className="mt-2 text-xs text-[#00B894] font-bold hover:underline"
                >
                  + הוספת תנועה ראשונה
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl text-center">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              בקרה שוטפת
            </p>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
              הוצאות החודש: ₪{snapshot.monthExpenseActual.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Section: Recent Transactions & AI Insight */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E2526] p-4 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-[#2D3636] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>תנועות אחרונות בחשבונות</span>
            </h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-[#00B894] hover:underline font-bold flex items-center gap-1"
            >
              <span>לכל התנועות</span>
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 space-y-2">
              <p>טרם הוזנו תנועות במערכת.</p>
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#00B894] font-bold hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>הוסף תנועה ראשונה</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-[#2D3636]">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {tx.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                        {tx.category}
                      </span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                  <div
                    className={`font-mono font-bold text-base ${
                      tx.type === 'income'
                        ? 'text-[#00B894]'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}₪{tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 1 Col: Friendly AI Tip */}
        <div className="bg-white dark:bg-[#1E2526] p-4 sm:p-6 rounded-2xl border border-gray-200/80 dark:border-[#2D3636] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#00B894] font-bold text-xs mb-3">
              <Sparkles className="w-4 h-4" />
              <span>תובנת היועץ החכם</span>
            </div>

            <h4 className="font-bold text-gray-900 dark:text-white text-base mb-2">
              {featuredInsight.title}
            </h4>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {featuredInsight.text}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#2D3636] flex items-center justify-between">
            <button
              onClick={() => onAskAi(featuredInsight.text)}
              className="px-4 py-2 bg-[#00B894] hover:bg-[#00A383] text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
            >
              התייעץ עם ה-AI &larr;
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white font-medium"
            >
              לסימולטור
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
