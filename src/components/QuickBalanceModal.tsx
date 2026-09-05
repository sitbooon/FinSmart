import React, { useState } from 'react';
import { X, Check, Landmark, CreditCard as CardIcon, HelpCircle, ArrowRight } from 'lucide-react';
import { Account, CreditCard } from '../types';

interface QuickBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  creditCards: CreditCard[];
  onUpdateCheckingBalance: (newBalance: number) => void;
  onUpdateCreditCardBill: (cardId: string, newTotal: number) => void;
  currentAvailableMoney: number;
}

export const QuickBalanceModal: React.FC<QuickBalanceModalProps> = ({
  isOpen,
  onClose,
  accounts,
  creditCards,
  onUpdateCheckingBalance,
  onUpdateCreditCardBill,
  currentAvailableMoney,
}) => {
  const checkingAccount = accounts.find((a) => a.type === 'checking') || accounts[0];
  const primaryCard = creditCards[0];

  const [checkingInput, setCheckingInput] = useState<string>(
    checkingAccount ? checkingAccount.balance.toString() : '0'
  );
  const [cardInput, setCardInput] = useState<string>(
    primaryCard ? primaryCard.currentBillingTotal.toString() : '0'
  );
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync state if modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (checkingAccount) setCheckingInput(checkingAccount.balance.toString());
      if (primaryCard) setCardInput(primaryCard.currentBillingTotal.toString());
      setIsSuccess(false);
    }
  }, [isOpen, checkingAccount?.balance, primaryCard?.currentBillingTotal]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBal = parseFloat(checkingInput) || 0;
    onUpdateCheckingBalance(newBal);

    if (primaryCard) {
      const newCardTot = parseFloat(cardInput) || 0;
      onUpdateCreditCardBill(primaryCard.id, newCardTot);
    }

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#202728] rounded-3xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-2xl w-full max-w-md overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E1E8E7] dark:border-[#2D3636]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#EBF7F5] dark:bg-[#00B894]/20 flex items-center justify-center text-[#00B894]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#2D3436] dark:text-white">
                עדכון יתרה וחיובי אשראי מהיר
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                עדכנו ישירות את יתרת הבנק כדי שהכסף הפנוי יתעדכן במדויק
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#191D1E] text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Checking Balance Field */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] dark:text-gray-200 mb-1.5">
              יתרת עו״ש נוכחית בבנק (₪)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 font-bold">
                ₪
              </span>
              <input
                type="number"
                step="any"
                required
                value={checkingInput}
                onChange={(e) => setCheckingInput(e.target.value)}
                className="w-full pl-3 pr-8 py-3 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-lg font-bold text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                placeholder="למשל: 14500"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              היתרה שרואים כעת באפליקציית הבנק שלכם
            </p>
          </div>

          {/* Credit Card Bill Field (optional) */}
          {primaryCard && (
            <div>
              <label className="block text-xs font-bold text-[#2D3436] dark:text-gray-200 mb-1.5">
                חיוב קרוב בכרטיס אשראי ({primaryCard.name}) (₪)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 font-bold">
                  ₪
                </span>
                <input
                  type="number"
                  step="any"
                  value={cardInput}
                  onChange={(e) => setCardInput(e.target.value)}
                  className="w-full pl-3 pr-8 py-3 rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-lg font-bold text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
                  placeholder="סך החיוב הצפוי לרדת במועד הקרוב"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                יורד ב-{primaryCard.billingDay} לחודש. מחושב אוטומטית גם מכל עסקאות האשראי שהזנתם.
              </p>
            </div>
          )}

          {/* Live Preview of Real Available Money */}
          <div className="p-3.5 rounded-2xl bg-[#F9FBFA] dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                כסף פנוי אמיתי נוכחי:
              </span>
              <span className="text-sm font-black text-[#00B894]">
                ₪{currentAvailableMoney.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
              הכסף הפנוי מחושב אוטומטית: יתרת עו״ש + משכורות צפויות שנשארו החודש - חיובי אשראי - הוצאות קבועות שטרם ירדו.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#191D1E] transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="w-2/3 py-3 rounded-xl text-xs font-bold text-white bg-[#00B894] hover:bg-[#00A382] shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>עודכן בהצלחה!</span>
                </>
              ) : (
                <span>שמור ועדכן כסף פנוי</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
