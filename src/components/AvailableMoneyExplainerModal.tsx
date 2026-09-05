import React from 'react';
import { X, HelpCircle, ArrowDown, ArrowUp, CreditCard, Calendar, CheckCircle2, Edit3 } from 'lucide-react';
import { AvailableMoneyBreakdown } from '../types';

interface AvailableMoneyExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown?: AvailableMoneyBreakdown;
  onOpenQuickBalance: () => void;
}

export const AvailableMoneyExplainerModal: React.FC<AvailableMoneyExplainerModalProps> = ({
  isOpen,
  onClose,
  breakdown,
  onOpenQuickBalance,
}) => {
  if (!isOpen || !breakdown) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#202728] rounded-3xl border border-[#E1E8E7] dark:border-[#2D3636] shadow-2xl w-full max-w-lg overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E1E8E7] dark:border-[#2D3636]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#EBF7F5] dark:bg-[#00B894]/20 flex items-center justify-center text-[#00B894]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#2D3436] dark:text-white">
                איך מחושב ״כסף פנוי אמיתי״?
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                נוסחה שקופה ומדויקת שתמנע ממך להיכנס למינוס בסוף החודש
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

        {/* Content Formula */}
        <div className="p-5 space-y-3">
          {/* 1. Checking balance */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FBFA] dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                +
              </span>
              <div>
                <p className="text-xs font-bold text-[#2D3436] dark:text-white">
                  יתרת עו״ש נוכחית בבנק
                </p>
                <p className="text-[11px] text-gray-400">הכסף הנזיל שיושב עכשיו בחשבון הבנק</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                ₪{breakdown.currentCheckingBalance.toLocaleString()}
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenQuickBalance();
                }}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#2D3636] text-gray-400 hover:text-[#00B894] transition-colors"
                title="עריכת יתרה מהירה"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Expected Incomes */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FBFA] dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                +
              </span>
              <div>
                <p className="text-xs font-bold text-[#2D3436] dark:text-white">
                  הכנסות ומשכורות שטרם נכנסו החודש
                </p>
                <p className="text-[11px] text-gray-400">משכורות שמועד כניסתן טרם הגיע</p>
              </div>
            </div>
            <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
              ₪{breakdown.pendingIncomesThisMonth.toLocaleString()}
            </span>
          </div>

          {/* 3. Upcoming credit card bills */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FBFA] dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center text-xs font-bold">
                -
              </span>
              <div>
                <p className="text-xs font-bold text-[#2D3436] dark:text-white">
                  חיוב כרטיסי אשראי צפוי במועד הקרוב
                </p>
                <p className="text-[11px] text-gray-400">סך כל העסקאות שבוצעו באשראי ויורדות ב-10/15 לחודש</p>
              </div>
            </div>
            <span className="font-mono font-bold text-sm text-rose-500">
              ₪{breakdown.upcomingCreditCardBills.toLocaleString()}
            </span>
          </div>

          {/* 4. Pending fixed expenses */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9FBFA] dark:bg-[#191D1E] border border-[#E1E8E7] dark:border-[#2D3636]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center text-xs font-bold">
                -
              </span>
              <div>
                <p className="text-xs font-bold text-[#2D3436] dark:text-white">
                  הוראות קבע והוצאות קבועות שטרם ירדו
                </p>
                <p className="text-[11px] text-gray-400">שכ״ד/משכנתא, ארנונה, ביטוחים שטרם חויבו</p>
              </div>
            </div>
            <span className="font-mono font-bold text-sm text-rose-500">
              ₪{breakdown.pendingFixedExpenses.toLocaleString()}
            </span>
          </div>

          {/* Total Real Available Money Result */}
          <div className="p-4 rounded-2xl bg-[#EBF7F5] dark:bg-[#00B894]/15 border-2 border-[#00B894] mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#00B894] uppercase tracking-wider">
                = סה״כ כסף פנוי אמיתי להמשך החודש
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-300 mt-0.5">
                הכסף שבטוח להוציא על קניות שוטפות בלי להיכנס למינוס
              </p>
            </div>
            <span className="text-2xl font-black text-[#2D3436] dark:text-white">
              ₪{breakdown.realAvailableMoney.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#E1E8E7] dark:border-[#2D3636] flex items-center justify-between gap-3 bg-[#F9FBFA] dark:bg-[#191D1E]">
          <span className="text-xs text-gray-400">
            היתרה לא מעודכנת מול הבנק?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenQuickBalance();
              }}
              className="px-4 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A382] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>עדכון יתרה מהיר</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-200 dark:hover:bg-[#2D3636] transition-colors"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
