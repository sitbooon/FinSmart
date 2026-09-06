import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CloudCheck,
  RefreshCw,
  Copy,
  Check,
  Share2,
  Smartphone,
  Laptop,
  Globe,
  FileSpreadsheet,
  CheckCircle2,
  KeyRound,
  Database,
} from 'lucide-react';
import { Household } from '../firebase/householdService';

interface HouseholdSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  currentHousehold: Household | null;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  onManualSync: () => Promise<void>;
  onCreateHousehold: (name: string) => Promise<void>;
  onJoinHousehold: (code: string) => Promise<void>;
  onInviteSpouse?: (email: string) => Promise<void>;
  prefilledInviteCode?: string;
  onOpenExcelModal?: () => void;
}

export const HouseholdSyncModal: React.FC<HouseholdSyncModalProps> = ({
  isOpen,
  onClose,
  currentHousehold,
  isSyncing,
  lastSyncedAt,
  onManualSync,
  onJoinHousehold,
  prefilledInviteCode = '',
  onOpenExcelModal,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [customCodeInput, setCustomCodeInput] = useState(prefilledInviteCode);
  const [isSwitchingCode, setIsSwitchingCode] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledInviteCode) {
      setCustomCodeInput(prefilledInviteCode);
    }
  }, [prefilledInviteCode]);

  if (!isOpen) return null;

  const currentCode = currentHousehold?.inviteCode || 'MASTER';

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?sync=${currentCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSwitchDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCodeInput.trim()) return;
    setIsSwitchingCode(true);
    setFeedbackMsg(null);
    try {
      await onJoinHousehold(customCodeInput.trim());
      setFeedbackMsg('מסד הנתונים הוחלף וסונכרן בהצלחה!');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg(err.message || 'שגיאה בחיבור למסד הנתונים');
    } finally {
      setIsSwitchingCode(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1E2425] rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-l from-emerald-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                סנכרון ענן ובין מכשירים
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  פעיל
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                מסד נתונים מרכזי המשותף לכל הדפדפנים והמכשירים שלך
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Real-time Status Card */}
          <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    הסנכרון פעיל ומחובר בזמן אמת
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {lastSyncedAt
                      ? `סונכרן לאחרונה: ${lastSyncedAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                      : 'ממתין לסנכרון ראשוני...'}
                  </p>
                </div>
              </div>

              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E2425] text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'מסנכרן...' : 'רענן כעת'}</span>
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
              ✓ ללא צורך בהתחברות או סיסמאות — המידע פרטי לחלוטין.
              <br />
              ✓ תנועה שנוספת בדפדפן X (במחשב או בנייד) תופיע מיד בדפדפן Y.
              <br />
              ✓ תואם באופן מלא לשרת Vercel ולכל פלטפורמה.
            </div>
          </div>

          {/* Quick Cross-Device Pairing (Share to Phone / other Browser) */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#252D2E]">
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-[#00B894]" />
              פתיחה בדפדפן או טלפון נוסף
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
              רוצה לפתוח את אותו מסד נתונים במכשיר אחר? פשוט שלח את הקישור או הקוד:
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E2425] hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all shadow-2xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Globe className="w-4 h-4 text-emerald-600" />}
                <span>{copiedLink ? 'הקישור הועתק!' : 'העתק קישור סנכרון ישיר'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E2425] hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all shadow-2xs"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                <span>קוד: {currentCode}</span>
              </button>
            </div>
          </div>

          {/* Excel Database Integration Shortcut */}
          {onOpenExcelModal && (
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-500/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                    מסד נתונים מבוסס קובץ אקסל
                  </h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    ייצוא קובץ XLSX מלא, עריכה מקומית או טעינה חוזרת לסנכרון מיידי
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenExcelModal();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                פתח אקסל
              </button>
            </div>
          )}

          {/* Custom Database / Ledger Code switch (Optional for users who want multiple separate ledgers) */}
          <div className="pt-2">
            <details className="text-xs text-gray-500 dark:text-gray-400">
              <summary className="cursor-pointer font-medium hover:text-gray-800 dark:hover:text-gray-200 py-1 select-none flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>הגדרות מתקדמות: שינוי קוד מסד נתונים</span>
              </summary>
              <form onSubmit={handleSwitchDatabase} className="mt-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#252D2E] space-y-2">
                <p className="text-[11px] leading-tight text-gray-500 dark:text-gray-400">
                  אם יש לך קוד מסד נתונים אחר או ברצונך לחבר מכשיר לקוד ספציפי:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCodeInput}
                    onChange={(e) => setCustomCodeInput(e.target.value)}
                    placeholder="לדוגמה: MASTER או FAM-1234"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E2425] text-xs font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isSwitchingCode || !customCodeInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#00B894] hover:bg-[#00A383] text-white text-xs font-bold disabled:opacity-50"
                  >
                    {isSwitchingCode ? 'מחבר...' : 'החלף'}
                  </button>
                </div>
                {feedbackMsg && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {feedbackMsg}
                  </p>
                )}
              </form>
            </details>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#252D2E]/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
