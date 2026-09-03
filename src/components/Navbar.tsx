import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  PieChart,
  CreditCard,
  Sparkles,
  Sliders,
  PiggyBank,
  Briefcase,
  FileBarChart2,
  Upload,
  PlusCircle,
  RotateCcw,
  Users,
  Moon,
  Sun,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Database,
} from 'lucide-react';
import { MonthHealthStatus } from '../types';

export type TabType =
  | 'dashboard'
  | 'cashflow'
  | 'transactions'
  | 'budgets'
  | 'accounts'
  | 'simulator'
  | 'ai'
  | 'savings'
  | 'investments'
  | 'reports'
  | 'settings';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  monthStatus: MonthHealthStatus;
  familyMember: string;
  setFamilyMember: (member: string) => void;
  onOpenAddModal: () => void;
  onOpenCsvModal: () => void;
  onResetDemo: () => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  isDemoMode?: boolean;
  onOpenDataModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  monthStatus,
  familyMember,
  setFamilyMember,
  onOpenAddModal,
  onOpenCsvModal,
  onResetDemo,
  isDark,
  setIsDark,
  isDemoMode = false,
  onOpenDataModal,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'דשבורד', icon: LayoutDashboard },
    { id: 'cashflow' as TabType, label: 'מערכת תזרים', icon: TrendingUp },
    { id: 'transactions' as TabType, label: 'תנועות', icon: Receipt },
    { id: 'budgets' as TabType, label: 'תקציבים', icon: PieChart },
    { id: 'accounts' as TabType, label: 'חשבונות וכרטיסים', icon: CreditCard },
    { id: 'simulator' as TabType, label: 'סימולטור', icon: Sliders },
    { id: 'ai' as TabType, label: 'יועץ AI', icon: Sparkles },
    { id: 'savings' as TabType, label: 'חיסכון וחובות', icon: PiggyBank },
    { id: 'investments' as TabType, label: 'השקעות', icon: Briefcase },
    { id: 'reports' as TabType, label: 'שווי נקי ודוחות', icon: FileBarChart2 },
  ];

  const getStatusBadge = () => {
    switch (monthStatus) {
      case 'good':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-[#202728] rounded-full border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs text-xs font-bold text-[#2D3436] dark:text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00B894]"></span>
            <span>החודש במסלול מצוין</span>
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-[#202728] rounded-full border border-[#FFEAA7] dark:border-amber-800/60 shadow-xs text-xs font-bold text-[#D6A317] dark:text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FDCB6E]"></span>
            <span>דורש תשומת לב</span>
          </div>
        );
      case 'danger':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-[#202728] rounded-full border border-rose-200 dark:border-rose-800/60 shadow-xs text-xs font-bold text-[#FF7675] animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7675]"></span>
            <span>גירעון צפוי</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#202728]/95 backdrop-blur-md border-b border-[#E1E8E7] dark:border-[#2D3636] transition-colors">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00B894] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#2D3436] dark:text-white">
                  FinSmart
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894]">
                  חכם
                </span>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-400 leading-none hidden sm:block mt-0.5">
                מערכת הפעלה פיננסית אישית ומשפחתית
              </p>
            </div>
          </div>

          {/* Center: Month Status + Family Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {getStatusBadge()}

            {/* Family Profile Switcher */}
            <div className="relative inline-flex items-center bg-[#F4F7F6] dark:bg-[#191D1E] rounded-lg p-0.5 border border-[#E1E8E7] dark:border-[#2D3636] text-xs">
              <Users className="w-3.5 h-3.5 mr-2 text-gray-400" />
              {(['משותף', 'דניאל', 'מיכל'] as const).map((member) => (
                <button
                  key={member}
                  onClick={() => setFamilyMember(member)}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    familyMember === member
                      ? 'bg-white dark:bg-[#202728] text-[#2D3436] dark:text-white shadow-xs font-bold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-[#2D3436]'
                  }`}
                >
                  {member}
                </button>
              ))}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white text-xs font-bold shadow-xs transition-colors"
              title="הוספת תנועה חדשה"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">הוסף תנועה</span>
            </button>

            <button
              onClick={onOpenCsvModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#252D2E] hover:bg-gray-50 dark:hover:bg-[#2D3636] text-[#2D3436] dark:text-slate-200 text-xs font-semibold border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs transition-colors"
              title="ייבוא תנועות מקובץ CSV / אקסל"
            >
              <Upload className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden md:inline">ייבוא CSV</span>
            </button>

            {onOpenDataModal && (
              <button
                onClick={onOpenDataModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                  isDemoMode
                    ? 'bg-[#FFF9EB] dark:bg-amber-950/40 text-[#D6A317] border-[#FFEAA7] dark:border-amber-800/60 hover:bg-[#FFF3D6]'
                    : 'bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] border-[#00B894]/30 hover:bg-[#d8f2ec]'
                }`}
                title="ניהול נתונים, גיבוי לקובץ ומעבר בין גרסה נקייה לדמו"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isDemoMode ? 'מצב: דמו' : 'מצב: גרסה נקייה'}
                </span>
                <span className="text-[10px] opacity-70 hidden md:inline">• נשמר ✓</span>
              </button>
            )}

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-[#2D3436] dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252D2E] transition-colors"
              title={isDark ? 'מצב בהיר' : 'מצב כהה'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Bar Tabs */}
        <div className="flex items-center space-x-reverse space-x-1.5 overflow-x-auto no-scrollbar py-2 border-t border-[#E1E8E7] dark:border-[#2D3636]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] font-bold shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[#2D3436] dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-[#252D2E] font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00B894]' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
