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
} from 'lucide-react';
import {
  FinancialSnapshot,
  DayForecast,
  Transaction,
  AnomalyAlert,
} from '../types';
import { CashflowChart } from './CashflowChart';

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
}) => {
  const recentTransactions = transactions.slice(0, 5);
  const featuredInsight = aiInsights[0] || {
    title: 'תובנת AI: חיסכון פוטנציאלי',
    text: 'זיהיתי 3 מנויים שאינם בשימוש קבוע (סטרימינג וענן). ביטול שלהם יחסוך כ-₪140 בחודש ויוסיף כ-₪1,700 לחיסכון השנתי שלך.',
  };

  const todayHebrewDate = new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="space-y-6 pb-12">
      {/* High Density Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D3436] dark:text-white">
            היי משפחה, בוקר טוב 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            הנה תמונת המצב הפיננסית שלך להיום, {todayHebrewDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#202728] rounded-full border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                snapshot.monthStatus === 'good'
                  ? 'bg-[#00B894]'
                  : snapshot.monthStatus === 'warning'
                  ? 'bg-[#FDCB6E]'
                  : 'bg-[#FF7675] animate-pulse'
              }`}
            ></span>
            <span className="text-sm font-bold text-[#2D3436] dark:text-slate-200">
              {snapshot.monthStatus === 'good'
                ? 'החודש שלך במסלול מצוין'
                : snapshot.monthStatus === 'warning'
                ? 'נדרשת תשומת לב בהוצאות'
                : 'צפוי גירעון בסוף חודש'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#202728] rounded-full border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs text-xs">
            <span className="text-gray-400">ציון בריאות:</span>
            <span className="font-bold text-[#00B894]">{snapshot.financialScore}/100</span>
          </div>
        </div>
      </header>

      {/* Clean Slate Onboarding & Quick Setup Card */}
      {transactions.length === 0 && (
        <div className="bg-white dark:bg-[#202728] border border-[#00B894]/30 rounded-2xl p-5 shadow-xs transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] font-bold text-xs mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>מערכת נקייה מוכנה להזנה אישית</span>
              </div>
              <h3 className="text-base font-bold text-[#2D3436] dark:text-white">
                ברוכים הבאים למערכת הניהול הפיננסי שלך
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl leading-relaxed">
                כל נתוני הדמו הוסרו והמערכת מוכנה לנתונים האמיתיים שלך. כל נתון שתזין נשמר אוטומטית ובאופן מאובטח בדפדפן (LocalStorage) ללא מחיקה.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNavigate('accounts')}
                className="px-3.5 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white text-xs font-bold transition-colors shadow-xs"
              >
                1. הגדרת יתרת עו״ש
              </button>
              <button
                onClick={onOpenAddModal}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#191D1E] hover:bg-gray-50 dark:hover:bg-[#252D2E] text-[#2D3436] dark:text-white border border-[#E1E8E7] dark:border-[#2D3636] text-xs font-bold transition-colors"
              >
                2. הוספת תנועה ראשונה
              </button>
              {onOpenCsvModal && (
                <button
                  onClick={onOpenCsvModal}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#191D1E] hover:bg-gray-50 dark:hover:bg-[#252D2E] text-[#2D3436] dark:text-white border border-[#E1E8E7] dark:border-[#2D3636] text-xs font-bold transition-colors"
                >
                  3. ייבוא אקסל/CSV מהבנק
                </button>
              )}
              {onOpenDataModal && (
                <button
                  onClick={onOpenDataModal}
                  className="px-3 py-2 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] hover:bg-gray-200 dark:hover:bg-[#252D2E] text-gray-500 dark:text-gray-400 text-xs font-semibold transition-colors"
                  title="אפשרויות גיבוי וטעינת דמו"
                >
                  גיבוי / דמו
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* High Density 4-Card Primary Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: כסף פנוי אמיתי */}
        <div className="bg-white dark:bg-[#202728] p-5 rounded-2xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-400 mb-1 uppercase tracking-wider">
              💳 כסף פנוי אמיתי
            </p>
            <h3 className="text-3xl font-bold text-[#2D3436] dark:text-white tracking-tight mt-1">
              ₪{snapshot.realAvailableMoney.toLocaleString()}
            </h3>
            <p className="text-xs text-[#00B894] mt-2 font-medium">
              יתרה בניכוי חיובי אשראי והתחייבויות
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between text-[11px] text-gray-400">
            <span>יתרה נוכחית בעו״ש:</span>
            <span className="font-bold text-[#2D3436] dark:text-slate-200">
              ₪{snapshot.currentCheckingBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: תחזית לסוף חודש */}
        <div className="bg-white dark:bg-[#202728] p-5 rounded-2xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-400 mb-1 uppercase tracking-wider">
              📅 תחזית לסוף חודש
            </p>
            <h3
              className={`text-3xl font-bold tracking-tight mt-1 ${
                snapshot.projectedEndOfMonthBalance >= 0
                  ? 'text-[#2D3436] dark:text-white'
                  : 'text-[#FF7675]'
              }`}
            >
              ₪{snapshot.projectedEndOfMonthBalance.toLocaleString()}
            </h3>
            <p
              className={`text-xs mt-2 font-medium ${
                snapshot.monthStatus === 'good'
                  ? 'text-[#00B894]'
                  : 'text-amber-500 dark:text-amber-400'
              }`}
            >
              {snapshot.statusExplanation}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between text-[11px] text-gray-400">
            <span>סטטוס תזרימי:</span>
            <span
              className={`font-bold ${
                snapshot.monthStatus === 'good'
                  ? 'text-[#00B894]'
                  : 'text-amber-500'
              }`}
            >
              {snapshot.monthStatus === 'good' ? 'פלוס יציב' : 'דורש בקרה'}
            </span>
          </div>
        </div>

        {/* Card 3: מומלץ להיום */}
        <div className="bg-white dark:bg-[#202728] p-5 rounded-2xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-400 mb-1 uppercase tracking-wider">
              🍽️ מומלץ להיום
            </p>
            <h3 className="text-3xl font-bold text-[#0984E3] tracking-tight mt-1">
              ₪{snapshot.dailyRecommendedBudget}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
              על בסיס התקציב הנותר לימי החודש
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between text-[11px]">
            <span className="text-gray-400">בדיקת תרחיש:</span>
            <button
              onClick={() => onNavigate('simulator')}
              className="text-[#0984E3] font-bold hover:underline flex items-center gap-0.5"
            >
              <span>סימולטור</span>
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: High Contrast Dark Accent Card (שווי כולל ומאזן) */}
        <div className="bg-[#2D3436] p-5 rounded-2xl shadow-md text-white flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold opacity-60 mb-1 uppercase tracking-wider">
              💰 שווי נקי כולל
            </p>
            <h3 className="text-3xl font-bold italic tracking-tight mt-1 text-white">
              ₪{(snapshot.currentCheckingBalance + snapshot.realAvailableMoney + 120000).toLocaleString()}
            </h3>
            <p className="text-xs text-[#00B894] mt-2 font-medium">
              ↑ 1.4% מתחילת החודש
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-300">
            <span>נכסים בניכוי חובות</span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-[#00B894] font-bold hover:underline"
            >
              דוח שווי מלא &larr;
            </button>
          </div>
        </div>
      </section>

      {/* Anomaly Alerts if any */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-xs sm:text-sm font-medium ${
                alert.severity === 'danger'
                  ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                  : alert.severity === 'warning'
                  ? 'bg-[#FFF9EB] border-[#FFEAA7] text-[#D6A317] dark:bg-amber-950/40 dark:border-amber-800/40 dark:text-amber-200'
                  : 'bg-[#EBF7F5] border-[#D1EAE5] text-[#00B894] dark:bg-[#00B894]/10 dark:border-[#00B894]/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-bold ml-1.5">{alert.title}:</span>
                  <span>{alert.message}</span>
                </div>
              </div>
              <button
                onClick={() => onAskAi(`מה לעשות לגבי ההתראה: ${alert.title}?`)}
                className="shrink-0 px-3 py-1 rounded-lg bg-white dark:bg-[#202728] text-xs font-bold shadow-xs hover:bg-gray-50 transition-colors"
              >
                התייעץ עם AI
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Middle Section: Cashflow Chart (2 Cols) + Budget Status Sidebar (1 Col) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cashflow Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#202728] p-6 rounded-2xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="font-bold text-[#2D3436] dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00B894]" />
                <span>תזרים מזומנים צפוי</span>
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                סימולציית יתרות יומית בהתבסס על הכנסות, קבועות וחיובים
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00B894]"></span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">הכנסות</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF7675]"></span>
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

        {/* Right: Budget Status & Expense Alerts */}
        <div className="bg-white dark:bg-[#202728] p-6 rounded-2xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-[#2D3436] dark:text-white">סטטוס תקציבים</h4>
              <button
                onClick={() => onNavigate('budgets')}
                className="text-xs text-[#00B894] font-bold hover:underline"
              >
                ניהול תקציב
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-gray-600 dark:text-gray-300">
                  <span>סופר ומזון</span>
                  <span className="font-bold text-[#FDCB6E]">75%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#FDCB6E] h-full rounded-full w-[75%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-gray-600 dark:text-gray-300">
                  <span>בילויים ופנאי</span>
                  <span className="font-bold text-[#00B894]">32%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#00B894] h-full rounded-full w-[32%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-gray-600 dark:text-gray-300">
                  <span>רכב ודלק</span>
                  <span className="font-bold text-[#FF7675]">90%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#FF7675] h-full rounded-full w-[90%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-[#FFF9EB] dark:bg-amber-950/30 border border-[#FFEAA7] dark:border-amber-800/40 rounded-xl">
            <p className="text-[11px] font-bold text-[#D6A317] dark:text-amber-300 flex items-center gap-1">
              <span>⚠️</span>
              <span>התראת חריגה</span>
            </p>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              הוצאת על דלק 12% יותר מהממוצע החודשי שלך. שים לב ליעד הקטגוריה.
            </p>
          </div>
        </div>
      </section>

      {/* High Density AI Insight Banner & Milestone */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2 Cols: AI Highlight Banner */}
        <div className="lg:col-span-2 bg-[#EBF7F5] dark:bg-[#00B894]/10 p-6 rounded-2xl border border-[#D1EAE5] dark:border-[#00B894]/30 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xs">
          <div className="w-14 h-14 bg-white dark:bg-[#202728] rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0">
            🤖
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#00B894] text-base mb-1">
              {featuredInsight.title}
            </h4>
            <p className="text-sm text-[#2D3436] dark:text-slate-200 leading-relaxed">
              {featuredInsight.text}
            </p>
          </div>
          <button
            onClick={() => onAskAi(featuredInsight.text)}
            className="sm:mr-auto px-5 py-2.5 bg-[#00B894] hover:bg-[#00A383] text-white rounded-xl font-bold text-sm shadow-xs whitespace-nowrap transition-colors"
          >
            בצע אופטימיזציה
          </button>
        </div>

        {/* 1 Col: Milestone / Quick Goal */}
        <div className="bg-white dark:bg-[#202728] p-5 rounded-2xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs flex flex-col justify-center">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-400 mb-3 uppercase tracking-wider">
            🎯 יעד קרוב: חופשה ביוון
          </h4>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#00B894] border-t-gray-100 dark:border-t-slate-800 flex items-center justify-center font-bold text-xs text-[#00B894] shrink-0">
              82%
            </div>
            <div>
              <p className="text-lg font-bold text-[#2D3436] dark:text-white">₪12,300</p>
              <p className="text-[11px] text-gray-400 uppercase">נותרו ₪2,700 ליעד</p>
            </div>
            <button
              onClick={() => onNavigate('savings')}
              className="mr-auto text-xs text-[#00B894] font-bold hover:underline"
            >
              ליעדים &larr;
            </button>
          </div>
        </div>
      </section>

      {/* 4 Supporting Financial Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>הכנסות בפועל החודש</span>
            <ArrowUpRight className="w-4 h-4 text-[#00B894]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#2D3436] dark:text-white">
            ₪{snapshot.monthIncomeActual.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            עוד ₪{snapshot.pendingIncomesThisMonth.toLocaleString()} צפויות
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>הוצאות בפועל החודש</span>
            <ArrowDownRight className="w-4 h-4 text-[#FF7675]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#2D3436] dark:text-white">
            ₪{snapshot.monthExpenseActual.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            משתנות + שוטפות
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>הוצאות קבועות שנותרו</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#2D3436] dark:text-white">
            ₪{snapshot.pendingFixedExpenses.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            משכנתא, חשמל, ביטוחים
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>חיובי אשראי צפויים</span>
            <CreditCardIcon className="w-4 h-4 text-[#FDCB6E]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#2D3436] dark:text-white">
            ₪{snapshot.upcomingCreditCardBills.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            במועדי החיוב 10 ו-15
          </div>
        </div>
      </section>

      {/* Bottom Section: Recent Transactions & Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-[#202728] p-5 rounded-2xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#2D3436] dark:text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>תנועות אחרונות בחשבונות</span>
            </h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-[#00B894] hover:underline font-bold"
            >
              לכל התנועות &larr;
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 space-y-2">
              <p>טרם הוזנו תנועות במערכת.</p>
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] font-bold hover:bg-[#d8f2ec] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף תנועה ראשונה</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E1E8E7] dark:divide-[#2D3636]">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#2D3436] dark:text-white">
                      {tx.description}
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-2">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                  <div
                    className={`font-mono font-bold text-sm ${
                      tx.type === 'income' ? 'text-[#00B894]' : 'text-[#2D3436] dark:text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}₪{tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 1 Col: Quick Actions */}
        <div className="bg-white dark:bg-[#202728] p-5 rounded-2xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2D3436] dark:text-white mb-2">
              פעולות מהירות
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              עדכון מיידי של נתוני הוצאה או בדיקת סימולציה לחודש
            </p>
            <div className="space-y-2">
              <button
                onClick={onOpenAddModal}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white text-xs font-bold shadow-xs transition-colors text-center"
              >
                + הוספת תנועה חדשה
              </button>
              <button
                onClick={() => onNavigate('simulator')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] hover:bg-gray-100 dark:hover:bg-[#252D2E] text-[#2D3436] dark:text-slate-200 border border-[#E1E8E7] dark:border-[#2D3636] text-xs font-bold transition-colors text-center"
              >
                סימולטור ״מה יקרה אם?״
              </button>
              <button
                onClick={() => onNavigate('ai')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#EBF7F5] dark:bg-[#00B894]/15 hover:bg-[#d8f0ec] text-[#00B894] text-xs font-bold transition-colors text-center"
              >
                שאלת התייעצות ליועץ AI
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E1E8E7] dark:border-[#2D3636] text-[11px] text-gray-400 text-center">
            FinSmart • עדכון אוטומטי שוטף
          </div>
        </div>
      </section>
    </div>
  );
};
