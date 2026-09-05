import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  PieChart,
  CreditCard,
  Sparkles,
  Sliders,
  PiggyBank,
  FileBarChart2,
  FileSpreadsheet,
  PlusCircle,
  Moon,
  Sun,
  Database,
  MoreHorizontal,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { MonthHealthStatus, MonthSummary } from '../types';
import { MonthSelector } from './MonthSelector';

export type TabType =
  | 'dashboard'
  | 'cashflow'
  | 'transactions'
  | 'budgets'
  | 'accounts'
  | 'simulator'
  | 'ai'
  | 'savings'
  | 'reports'
  | 'settings';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  monthStatus: MonthHealthStatus;
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  monthlySummaries?: MonthSummary[];
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
  selectedMonth,
  onSelectMonth,
  monthlySummaries = [],
  onOpenAddModal,
  onOpenCsvModal,
  onResetDemo,
  isDark,
  setIsDark,
  isDemoMode = false,
  onOpenDataModal,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  // Primary core tabs (most frequently used)
  const primaryTabs = [
    { id: 'dashboard' as TabType, label: 'דשבורד', icon: LayoutDashboard },
    { id: 'transactions' as TabType, label: 'תנועות', icon: Receipt },
    { id: 'cashflow' as TabType, label: 'תזרים', icon: TrendingUp },
    { id: 'budgets' as TabType, label: 'תקציב', icon: PieChart },
    { id: 'accounts' as TabType, label: 'חשבונות', icon: CreditCard },
  ];

  // Secondary tools tabs
  const secondaryTabs = [
    { id: 'ai' as TabType, label: 'יועץ AI חכם', icon: Sparkles, badge: 'חכם' },
    { id: 'simulator' as TabType, label: 'סימולטור ״מה אם?״', icon: Sliders },
    { id: 'savings' as TabType, label: 'יעדי חיסכון', icon: PiggyBank },
    { id: 'reports' as TabType, label: 'דוחות וסיכומים', icon: FileBarChart2 },
  ];

  const isSecondaryActive = secondaryTabs.some((t) => t.id === activeTab);
  const activeSecondaryTab = secondaryTabs.find((t) => t.id === activeTab);

  const getStatusBadge = () => {
    switch (monthStatus) {
      case 'good':
        return (
          <div
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs"
            title="התזרים החודשי מאוזן ויציב"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>מאוזן ויציב</span>
          </div>
        );
      case 'warning':
        return (
          <div
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-full border border-amber-200 dark:border-amber-800/60 text-xs font-semibold text-amber-700 dark:text-amber-300 shadow-2xs"
            title="חריגות קלות או יתרה נמוכה"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>תשומת לב</span>
          </div>
        );
      case 'danger':
        return (
          <div
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/40 rounded-full border border-rose-200 dark:border-rose-800/60 text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-2xs"
            title="סכנת גירעון או חריגה מהמסגרת"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>צפוי גירעון</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleMobileNav = (tabId: TabType) => {
    setActiveTab(tabId);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1E2526]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-[#2D3636] transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Main Header Bar */}
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 text-right group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#00B894] rounded-xl p-0.5 sm:p-1"
                aria-label="דשבורד ראשי פינסמארט"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-[#00B894] to-emerald-400 rounded-xl flex items-center justify-center text-white font-black text-base sm:text-lg shadow-xs group-hover:scale-105 transition-transform">
                  F
                </div>
                <div>
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-gray-900 dark:text-white">
                    FinSmart
                  </span>
                  <p className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                    ניהול פיננסי פשוט
                  </p>
                </div>
              </button>
            </div>

            {/* Center: Month Selector & Status */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <MonthSelector
                selectedMonth={selectedMonth}
                onSelectMonth={onSelectMonth}
                monthlySummaries={monthlySummaries}
              />
              <div className="hidden sm:block">
                {getStatusBadge()}
              </div>
            </div>

            {/* Right Action buttons - Desktop View */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white text-xs font-bold shadow-xs transition-all hover:shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00B894] active:scale-98"
                title="הוספת תנועה חדשה (הכנסה או הוצאה)"
              >
                <PlusCircle className="w-4 h-4" />
                <span>הוסף תנועה</span>
              </button>

              <button
                onClick={onOpenCsvModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60 shadow-2xs transition-all"
                title="ייבוא תנועות מקובץ אקסל או CSV מהבנק"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline">ייבוא מהבנק</span>
              </button>

              {onOpenDataModal && (
                <button
                  onClick={onOpenDataModal}
                  className={`flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
                    isDemoMode
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
                      : 'bg-gray-50 dark:bg-[#252D2E] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                  }`}
                  title="גיבוי, שמירה וטעינת נתונים"
                  aria-label="ניהול נתונים וגיבוי"
                >
                  <Database className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="hidden lg:inline">
                    {isDemoMode ? 'מצב: דמו' : 'נתונים שמורים'}
                  </span>
                </button>
              )}

              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252D2E] transition-colors"
                title={isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
                aria-label="החלפת מצב תצוגה כהה/בהיר"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Mobile Header Right Actions (Clean & simple: Excel + Dark Mode) */}
            <div className="flex sm:hidden items-center gap-1 shrink-0">
              <button
                onClick={onOpenCsvModal}
                className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                title="ייבוא מאקסל/בנק"
                aria-label="ייבוא מאקסל"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252D2E] transition-colors"
                title={isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
                aria-label="החלפת מצב תצוגה"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on mobile – replaced by bottom nav) */}
          <nav
            className="hidden sm:flex items-center justify-between overflow-x-auto no-scrollbar py-2 border-t border-gray-100 dark:border-[#2D3636] gap-1 text-xs"
            role="tablist"
            aria-label="ניווט ראשי במערכת"
          >
            {/* Primary Core Tabs */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {primaryTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={isActive}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#00B894] dark:text-emerald-400 font-bold shadow-2xs ring-1 ring-emerald-200 dark:ring-emerald-800/60'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-[#252D2E]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00B894] dark:text-emerald-400' : 'text-gray-400 dark:text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Secondary / Extended Tools */}
            <div className="flex items-center gap-1 sm:gap-1.5 mr-auto pl-1">
              {/* Desktop direct links for secondary tools */}
              <div className="hidden lg:flex items-center gap-1">
                {secondaryTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      aria-selected={isActive}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#00B894] dark:text-emerald-400 font-bold shadow-2xs ring-1 ring-emerald-200 dark:ring-emerald-800/60'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-[#252D2E]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dropdown for Medium screens */}
              <div className="relative lg:hidden" ref={moreMenuRef}>
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                    isSecondaryActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#00B894] font-bold ring-1 ring-emerald-200'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252D2E]'
                  }`}
                  aria-expanded={isMoreMenuOpen}
                  aria-haspopup="true"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span>{isSecondaryActive ? activeSecondaryTab?.label : 'עוד כלים'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-[#252D2E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                      כלים נוספים
                    </div>
                    {secondaryTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMoreMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-right text-xs transition-colors ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#00B894] font-bold'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D3636]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#00B894]' : 'text-gray-400'}`} />
                            <span>{tab.label}</span>
                          </div>
                          {tab.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1E2526]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-[#2D3636] px-2 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        aria-label="ניווט מובייל"
      >
        <div className="flex items-center justify-around">
          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors min-w-[56px] ${
              activeTab === 'dashboard'
                ? 'text-[#00B894] font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">דשבורד</span>
          </button>

          {/* 2. Transactions */}
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors min-w-[56px] ${
              activeTab === 'transactions'
                ? 'text-[#00B894] font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">תנועות</span>
          </button>

          {/* 3. Center Elevated Quick Add Button */}
          <button
            onClick={onOpenAddModal}
            className="w-12 h-12 -mt-5 rounded-2xl bg-[#00B894] hover:bg-[#00A383] text-white shadow-lg flex items-center justify-center ring-4 ring-white dark:ring-[#1E2526] active:scale-90 transition-transform"
            title="הוספת תנועה חדשה"
            aria-label="הוסף תנועה חדשה"
          >
            <PlusCircle className="w-6 h-6" />
          </button>

          {/* 4. Cashflow */}
          <button
            onClick={() => setActiveTab('cashflow')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors min-w-[56px] ${
              activeTab === 'cashflow'
                ? 'text-[#00B894] font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">תזרים</span>
          </button>

          {/* 5. More Menu Drawer Toggle */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors min-w-[56px] relative ${
              isSecondaryActive || activeTab === 'budgets' || activeTab === 'accounts'
                ? 'text-[#00B894] font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">עוד כלים</span>
            {(isSecondaryActive || activeTab === 'budgets' || activeTab === 'accounts') && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B894] absolute top-1 right-3.5"></span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Sheet) for All Tools */}
      {isMobileDrawerOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white dark:bg-[#1E2526] rounded-t-3xl border-t border-gray-200 dark:border-[#2D3636] p-5 max-h-[85vh] overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
            {/* Handle bar */}
            <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2D3636] mb-4">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  כל הכלים והפיצ׳רים
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  גישה מהירה לכל מודולי המערכת
                </p>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252D2E]"
                aria-label="סגור תפריט"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of Tools */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {/* 1. Budgets */}
              <button
                onClick={() => handleMobileNav('budgets')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl text-right transition-all border ${
                  activeTab === 'budgets'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#00B894] text-[#00B894] font-bold'
                    : 'bg-gray-50/80 dark:bg-[#252D2E] border-gray-200/80 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[#00B894] shrink-0">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">תקציבים ויעדים</div>
                  <div className="text-[10px] text-gray-400">מעקב חודשי</div>
                </div>
              </button>

              {/* 2. Accounts */}
              <button
                onClick={() => handleMobileNav('accounts')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl text-right transition-all border ${
                  activeTab === 'accounts'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#00B894] text-[#00B894] font-bold'
                    : 'bg-gray-50/80 dark:bg-[#252D2E] border-gray-200/80 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[#00B894] shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">חשבונות ואשראי</div>
                  <div className="text-[10px] text-gray-400">עו״ש וכרטיסים</div>
                </div>
              </button>

              {/* 3. AI Advisor */}
              <button
                onClick={() => handleMobileNav('ai')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl text-right transition-all border ${
                  activeTab === 'ai'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#00B894] text-[#00B894] font-bold'
                    : 'bg-gray-50/80 dark:bg-[#252D2E] border-gray-200/80 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">יועץ AI חכם</div>
                  <div className="text-[10px] text-gray-400">תובנות והמלצות</div>
                </div>
              </button>

              {/* 4. Simulator */}
              <button
                onClick={() => handleMobileNav('simulator')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl text-right transition-all border ${
                  activeTab === 'simulator'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#00B894] text-[#00B894] font-bold'
                    : 'bg-gray-50/80 dark:bg-[#252D2E] border-gray-200/80 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">סימולטור ״מה אם?״</div>
                  <div className="text-[10px] text-gray-400">בדיקת החלטות</div>
                </div>
              </button>

              {/* 5. Savings */}
              <button
                onClick={() => handleMobileNav('savings')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl text-right transition-all border ${
                  activeTab === 'savings'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#00B894] text-[#00B894] font-bold'
                    : 'bg-gray-50/80 dark:bg-[#252D2E] border-gray-200/80 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">יעדי חיסכון</div>
                  <div className="text-[10px] text-gray-400">קופות ומטרות</div>
                </div>
              </button>

              {/* 6. Reports */}
              <button
                onClick={() => handleMobileNav('reports')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl text-right transition-all border ${
                  activeTab === 'reports'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#00B894] text-[#00B894] font-bold'
                    : 'bg-gray-50/80 dark:bg-[#252D2E] border-gray-200/80 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                  <FileBarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">דוחות וסיכומים</div>
                  <div className="text-[10px] text-gray-400">ניתוח שנתי</div>
                </div>
              </button>
            </div>

            {/* Direct Actions in Drawer */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-[#2D3636]">
              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onOpenCsvModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-[#00B894]" />
                  <span>ייבוא תנועות מקובץ אקסל / CSV מהבנק</span>
                </div>
                <span>&larr;</span>
              </button>

              {onOpenDataModal && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenDataModal();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#252D2E] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-gray-500" />
                    <span>גיבוי, שמירה וטעינת נתונים ({isDemoMode ? 'מצב דמו' : 'נתונים מקומיים'})</span>
                  </div>
                  <span>&larr;</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
