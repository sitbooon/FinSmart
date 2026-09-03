import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Receipt, CreditCard as CardIcon } from 'lucide-react';
import { Transaction, Category, Account, CreditCard } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Transaction) => void;
  categories: Category[];
  accounts: Account[];
  creditCards: CreditCard[];
  merchantRules: Record<string, string>;
  activeFamilyMember: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
  accounts,
  creditCards,
  merchantRules,
  activeFamilyMember,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('סופר ומזון');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc-1');
  const [paymentMethod, setPaymentMethod] = useState<'account' | 'credit_card'>('account');
  const [creditCardId, setCreditCardId] = useState(creditCards[0]?.id || '');
  const [isInstallments, setIsInstallments] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState('3');
  const [familyMember, setFamilyMember] = useState(activeFamilyMember || 'משותף');
  const [notes, setNotes] = useState('');
  const [autoMatched, setAutoMatched] = useState(false);

  // Auto categorization rule trigger
  useEffect(() => {
    if (!description) {
      setAutoMatched(false);
      return;
    }
    const lower = description.toLowerCase();
    for (const [merchant, catName] of Object.entries(merchantRules)) {
      if (lower.includes(merchant)) {
        setCategory(catName);
        setAutoMatched(true);
        return;
      }
    }
  }, [description, merchantRules]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date,
      description,
      amount: parseFloat(amount),
      type,
      category,
      accountId,
      creditCardId: paymentMethod === 'credit_card' ? creditCardId : undefined,
      isFixed: false,
      isBusiness: false,
      familyMember,
      notes: notes || undefined,
      installments:
        paymentMethod === 'credit_card' && isInstallments
          ? {
              current: 1,
              total: parseInt(totalInstallments) || 1,
              monthlyAmount: Math.round(parseFloat(amount) / (parseInt(totalInstallments) || 1)),
            }
          : undefined,
    };

    onAdd(newTx);
    onClose();
    // Reset form
    setDescription('');
    setAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EBF7F5] dark:bg-[#00B894]/20 flex items-center justify-center text-[#00B894]">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#2D3436] dark:text-white">
                הוספת תנועה חדשה
              </h2>
              <p className="text-[11px] text-gray-400">
                זיהוי אוטומטי של בית העסק והתאמת קטגוריה
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Expense / Income Toggle */}
          <div className="grid grid-cols-2 gap-1 bg-[#F4F7F6] dark:bg-[#191D1E] p-1 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg font-bold transition-all ${
                type === 'expense'
                  ? 'bg-[#FF7675] text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              הוצאה (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg font-bold transition-all ${
                type === 'income'
                  ? 'bg-[#00B894] text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              הכנסה (+)
            </button>
          </div>

          {/* Description & Auto categorization badge */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-gray-600 dark:text-gray-400 font-medium">
                תיאור / בית עסק
              </label>
              {autoMatched && (
                <span className="text-[10px] text-[#00B894] flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>זוהתה קטגוריה אוטומטית</span>
                </span>
              )}
            </div>
            <input
              type="text"
              required
              placeholder="לדוגמה: שופרסל דיל / פז / קפה ארומה"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                סכום (₪)
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0.1"
                placeholder="250"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] font-mono font-bold text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                תאריך
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
              />
            </div>
          </div>

          {/* Category & Family Member */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                קטגוריה
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setAutoMatched(false);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
                שיוך משפחתי
              </label>
              <select
                value={familyMember}
                onChange={(e) => setFamilyMember(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
              >
                <option value="משותף">משותף</option>
                <option value="דניאל">דניאל</option>
                <option value="מיכל">מיכל</option>
              </select>
            </div>
          </div>

          {/* Payment Method (Account vs Credit Card) */}
          <div className="pt-2 border-t border-[#E1E8E7] dark:border-[#2D3636]">
            <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
              אמצעי תשלום
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('account')}
                className={`py-1.5 px-3 rounded-xl border font-bold text-center transition-all ${
                  paymentMethod === 'account'
                    ? 'border-[#00B894] bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894]'
                    : 'border-[#E1E8E7] dark:border-[#2D3636] text-gray-600 dark:text-gray-400'
                }`}
              >
                עו״ש / העברה
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`py-1.5 px-3 rounded-xl border font-bold text-center transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-[#00B894] bg-[#EBF7F5] dark:bg-[#00B894]/20 text-[#00B894]'
                    : 'border-[#E1E8E7] dark:border-[#2D3636] text-gray-600 dark:text-gray-400'
                }`}
              >
                כרטיס אשראי
              </button>
            </div>

            {paymentMethod === 'credit_card' && (
              <div className="space-y-2 p-3 bg-[#F4F7F6] dark:bg-[#191D1E] rounded-xl border border-[#E1E8E7] dark:border-[#2D3636]">
                <div>
                  <label className="block text-gray-500 text-[11px] mb-1">בחר כרטיס אשראי</label>
                  <select
                    value={creditCardId}
                    onChange={(e) => setCreditCardId(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-white dark:bg-[#202728] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
                  >
                    {creditCards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (••• {c.lastFourDigits}) - חיוב ב-{c.billingDay}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInstallments}
                      onChange={(e) => setIsInstallments(e.target.checked)}
                      className="accent-[#00B894] rounded"
                    />
                    <span className="text-[#2D3436] dark:text-gray-300 font-medium">פריסה לתשלומים</span>
                  </label>

                  {isInstallments && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-[11px]">מס׳ תשלומים:</span>
                      <input
                        type="number"
                        min="2"
                        max="36"
                        value={totalInstallments}
                        onChange={(e) => setTotalInstallments(e.target.value)}
                        className="w-16 px-2 py-1 rounded-lg border border-[#E1E8E7] dark:border-[#2D3636] bg-white dark:bg-[#202728] text-center font-mono font-bold text-[#2D3436] dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">
              הערה (אופציונלי)
            </label>
            <input
              type="text"
              placeholder="הערה לתנועה..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white outline-none focus:border-[#00B894]"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] text-[#2D3436] dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-[#191D1E] transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white font-bold transition-colors shadow-xs"
            >
              הוסף תנועה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
