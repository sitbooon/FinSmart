import React, { useEffect, useState } from 'react';
import { RotateCcw, X, CheckCircle2 } from 'lucide-react';
import { Transaction } from '../types';

interface UndoToastProps {
  transaction: Transaction | null;
  notificationMessage?: string | null;
  onUndo: () => void;
  onDismiss: () => void;
  onOpenTrashBin?: () => void;
  deletedCount?: number;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  transaction,
  notificationMessage,
  onUndo,
  onDismiss,
  onOpenTrashBin,
  deletedCount = 0,
}) => {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);

  const durationMs = 9000;

  // Progress bar countdown
  useEffect(() => {
    if (!transaction && !notificationMessage) return;
    if (notificationMessage) {
      // Shorter timer for simple info notification
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }

    setProgress(100);
    const intervalMs = 100;
    const step = (intervalMs / durationMs) * 100;

    const timer = setInterval(() => {
      if (!isHovered) {
        setProgress((prev) => {
          if (prev <= step) {
            clearInterval(timer);
            onDismiss();
            return 0;
          }
          return prev - step;
        });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [transaction, notificationMessage, isHovered, onDismiss]);

  if (!transaction && !notificationMessage) return null;

  return (
    <div
      id="undo-toast-wrapper"
      className="fixed bottom-20 sm:bottom-6 right-3 left-3 sm:left-auto sm:right-6 z-50 max-w-md w-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        id="undo-toast-card"
        className="bg-slate-900/95 dark:bg-[#1E2526]/95 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-slate-700/80 dark:border-[#3A4546] backdrop-blur-md flex flex-col gap-2.5 animate-in slide-in-from-bottom-5 duration-300"
      >
        {notificationMessage ? (
          // Positive feedback state (e.g. "התנועה שוחזרה בהצלחה")
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notificationMessage}</span>
            </div>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          // Undo Deletion state
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    התנועה "{transaction?.description}" נמחקה
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <span>סכום: ₪{transaction?.amount.toLocaleString()}</span>
                    {deletedCount > 1 && onOpenTrashBin && (
                      <>
                        <span>•</span>
                        <button
                          onClick={onOpenTrashBin}
                          className="text-[#00B894] hover:underline font-semibold"
                        >
                          סל שחזור ({deletedCount})
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onUndo}
                  className="px-3 py-1.5 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>בטל מחיקה</span>
                </button>

                <button
                  onClick={onDismiss}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="סגור התראה"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Countdown bar */}
            <div className="w-full bg-slate-800 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
              <div
                className="bg-[#00B894] h-full transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
