import React, { useState } from 'react';
import {
  CreditCard as CardIcon,
  Landmark,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Wallet,
  PiggyBank,
  TrendingUp,
  Coins,
} from 'lucide-react';
import { Account, CreditCard, AccountType } from '../types';

interface AccountsViewProps {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  creditCards: CreditCard[];
  setCreditCards: React.Dispatch<React.SetStateAction<CreditCard[]>>;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  setAccounts,
  creditCards,
  setCreditCards,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'cards'>('accounts');

  // New Account state
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<AccountType>('checking');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccBank, setNewAccBank] = useState('');
  const [newAccNotes, setNewAccNotes] = useState('');

  // New Card state
  const [newCardName, setNewCardName] = useState('');
  const [newCardCompany, setNewCardCompany] = useState('ישראכרט');
  const [newCardDigits, setNewCardDigits] = useState('');
  const [newCardLimit, setNewCardLimit] = useState('');
  const [newCardBillingDay, setNewCardBillingDay] = useState('10');
  const [newCardBillingTotal, setNewCardBillingTotal] = useState('');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccBalance) return;
    const acc: Account = {
      id: `acc-${Date.now()}`,
      name: newAccName,
      type: newAccType,
      balance: parseFloat(newAccBalance),
      currency: '₪',
      bankName: newAccBank || 'בנק ישראלי',
      lastUpdated: 'עודכן זה עתה',
      notes: newAccNotes,
      isFamilyShared: true,
    };
    setAccounts((prev) => [...prev, acc]);
    setNewAccName('');
    setNewAccBalance('');
    setNewAccBank('');
    setNewAccNotes('');
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName || !newCardLimit) return;
    const card: CreditCard = {
      id: `card-${Date.now()}`,
      name: newCardName,
      company: newCardCompany,
      lastFourDigits: newCardDigits || '0000',
      limit: parseFloat(newCardLimit),
      billingDay: parseInt(newCardBillingDay) || 10,
      currentBillingTotal: parseFloat(newCardBillingTotal) || 0,
      remainingInstallmentsTotal: 0,
      linkedAccountId: accounts[0]?.id || 'acc-1',
    };
    setCreditCards((prev) => [...prev, card]);
    setNewCardName('');
    setNewCardLimit('');
    setNewCardDigits('');
    setNewCardBillingTotal('');
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const deleteCard = (id: string) => {
    setCreditCards((prev) => prev.filter((c) => c.id !== id));
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'checking':
        return Landmark;
      case 'savings':
        return PiggyBank;
      case 'investment':
        return TrendingUp;
      case 'cash':
        return Coins;
      default:
        return Wallet;
    }
  };

  const totalChecking = accounts
    .filter((a) => a.type === 'checking')
    .reduce((s, a) => s + a.balance, 0);
  const totalSavings = accounts
    .filter((a) => a.type === 'savings' || a.type === 'investment')
    .reduce((s, a) => s + a.balance, 0);
  const totalCreditCharges = creditCards.reduce((s, c) => s + c.currentBillingTotal, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D3436] dark:text-white flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#00B894]" />
            <span>חשבונות וכרטיסי אשראי</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            ניהול מרוכז של חשבונות עו״ש, חסכונות, תיקי השקעות וכרטיסי אשראי
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#F4F7F6] dark:bg-[#191D1E] p-1 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('accounts')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'accounts'
                ? 'bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#2D3436]'
            }`}
          >
            חשבונות ({accounts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('cards')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'cards'
                ? 'bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894] shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#2D3436]'
            }`}
          >
            כרטיסי אשראי ({creditCards.length})
          </button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="text-xs text-gray-400">יתרות עו״ש נזילות</div>
          <div className="text-xl sm:text-2xl font-black text-[#2D3436] dark:text-white mt-1">
            ₪{totalChecking.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="text-xs text-gray-400">חסכונות והשקעות בחשבונות</div>
          <div className="text-xl sm:text-2xl font-black text-[#00B894] mt-1">
            ₪{totalSavings.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
          <div className="text-xs text-gray-400">סך חיובים עתידיים באשראי</div>
          <div className="text-xl sm:text-2xl font-black text-[#FF7675] mt-1">
            ₪{totalCreditCharges.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Accounts List & Form */}
      {activeSubTab === 'accounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {accounts.map((acc) => {
              const Icon = getAccountIcon(acc.type);
              return (
                <div
                  key={acc.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF7F5] dark:bg-[#00B894]/20 flex items-center justify-center text-[#00B894]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#2D3436] dark:text-white">
                          {acc.name}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F4F7F6] dark:bg-[#191D1E] font-medium text-gray-600 dark:text-gray-300">
                          {acc.type === 'checking'
                            ? 'עו״ש'
                            : acc.type === 'savings'
                            ? 'חיסכון'
                            : acc.type === 'investment'
                            ? 'השקעות'
                            : 'מזומן'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        <span>{acc.bankName}</span>
                        {acc.notes && <span> • {acc.notes}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <div className="text-base sm:text-lg font-black font-mono text-[#2D3436] dark:text-white">
                        ₪{acc.balance.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-400">עודכן: {acc.lastUpdated}</div>
                    </div>

                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="text-gray-400 hover:text-[#FF7675] p-1.5 rounded-lg hover:bg-[#F4F7F6] dark:hover:bg-[#191D1E] transition-colors"
                      title="מחק חשבון"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Account Form */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs h-fit">
            <h3 className="text-sm font-bold text-[#2D3436] dark:text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00B894]" />
              <span>הוספת חשבון חדש</span>
            </h3>

            <form onSubmit={handleAddAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  שם החשבון
                </label>
                <input
                  type="text"
                  required
                  placeholder="עו״ש בנק הפועלים"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    סוג חשבון
                  </label>
                  <select
                    value={newAccType}
                    onChange={(e: any) => setNewAccType(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white"
                  >
                    <option value="checking">עו״ש</option>
                    <option value="savings">חיסכון</option>
                    <option value="investment">השקעות</option>
                    <option value="cash">מזומן</option>
                    <option value="other">אחר</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    יתרה נוכחית (₪)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="15000"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  שם הבנק / מוסד
                </label>
                <input
                  type="text"
                  placeholder="בנק הפועלים / מיטב / מזומן"
                  value={newAccBank}
                  onChange={(e) => setNewAccBank(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  הערות (אופציונלי)
                </label>
                <input
                  type="text"
                  placeholder="הערה קצרה על החשבון"
                  value={newAccNotes}
                  onChange={(e) => setNewAccNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white font-bold transition-colors shadow-xs"
              >
                הוסף חשבון
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Credit Cards List & Form */}
      {activeSubTab === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {creditCards.map((card) => {
              const utilPct = card.limit > 0 ? Math.round((card.currentBillingTotal / card.limit) * 100) : 0;
              return (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EBF7F5] dark:bg-[#00B894]/20 flex items-center justify-center text-[#00B894]">
                        <CardIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#2D3436] dark:text-white">
                          {card.name}{' '}
                          <span className="text-gray-400 font-mono text-xs">
                            (••• {card.lastFourDigits})
                          </span>
                        </h3>
                        <div className="text-xs text-gray-400">
                          {card.company} • מועד חיוב: ב-{card.billingDay} לחודש
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <div className="text-xs text-gray-400">חיוב קרוב צפוי</div>
                        <div className="text-base sm:text-lg font-black font-mono text-[#FF7675]">
                          ₪{card.currentBillingTotal.toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteCard(card.id)}
                        className="text-gray-400 hover:text-[#FF7675] p-1.5 rounded-lg hover:bg-[#F4F7F6] dark:hover:bg-[#191D1E] transition-colors"
                        title="מחק כרטיס"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Limit utilization bar */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E1E8E7] dark:border-[#2D3636]">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>ניצול מסגרת: {utilPct}%</span>
                      <span>
                        מסגרת: ₪{card.limit.toLocaleString()} | תשלומים עתידיים: ₪
                        {card.remainingInstallmentsTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          utilPct > 80 ? 'bg-[#FF7675]' : 'bg-[#00B894]'
                        }`}
                        style={{ width: `${Math.min(100, utilPct)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Credit Card Form */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs h-fit">
            <h3 className="text-sm font-bold text-[#2D3436] dark:text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00B894]" />
              <span>הוספת כרטיס אשראי</span>
            </h3>

            <form onSubmit={handleAddCard} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  שם הכרטיס
                </label>
                <input
                  type="text"
                  required
                  placeholder="כרטיס ישראכרט / ויזה / מאסטרקארד"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    חברה
                  </label>
                  <select
                    value={newCardCompany}
                    onChange={(e) => setNewCardCompany(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white"
                  >
                    <option value="ישראכרט">ישראכרט</option>
                    <option value="כאל">כאל (Cal)</option>
                    <option value="מקס">מקס (Max)</option>
                    <option value="דיינרס">דיינרס</option>
                    <option value="אמריקן אקספרס">אמריקן אקספרס</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    4 ספרות אחרונות
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={newCardDigits}
                    onChange={(e) => setNewCardDigits(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    מסגרת אשראי (₪)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="20000"
                    value={newCardLimit}
                    onChange={(e) => setNewCardLimit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    יום חיוב בחודש
                  </label>
                  <select
                    value={newCardBillingDay}
                    onChange={(e) => setNewCardBillingDay(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white font-mono"
                  >
                    <option value="2">2 לחודש</option>
                    <option value="10">10 לחודש</option>
                    <option value="15">15 לחודש</option>
                    <option value="20">20 לחודש</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  חיוב צפוי למועד הקרוב (₪)
                </label>
                <input
                  type="number"
                  placeholder="3500"
                  value={newCardBillingTotal}
                  onChange={(e) => setNewCardBillingTotal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white font-bold transition-colors shadow-xs"
              >
                הוסף כרטיס
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
