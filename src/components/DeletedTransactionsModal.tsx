import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Tag,
  Calendar,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { DeletedTransaction, Transaction } from '../types';

interface DeletedTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedTransactions: DeletedTransaction[];
  onRestore: (transaction: Transaction) => void;
  onRestoreAll: () => void;
  onPermanentlyDelete: (txId: string) => void;
  onClearTrash: () => void;
}

export const DeletedTransactionsModal: React.FC<DeletedTransactionsModalProps> = ({
  isOpen,
  onClose,
  deletedTransactions,
  onRestore,
  onRestoreAll,
  onPermanentlyDelete,
  onClearTrash,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [justRestoredId, setJustRestoredId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = deletedTransactions.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.transaction.description.toLowerCase().includes(term) ||
      item.transaction.category.toLowerCase().includes(term) ||
      (item.transaction.notes && item.transaction.notes.toLowerCase().includes(term))
    );
  });

  const formatTimeAgo = (isoString: string) => {
    try {
      const deletedTime = new Date(isoString).getTime();
      const now = Date.now();
      const diffSec = Math.floor((now - deletedTime) / 1000);

      if (diffSec < 60) return 'לפני פחות מדקה';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `לפני ${diffMin} דק׳`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `לפני ${diffHours} שעות`;
      const diffDays = Math.floor(diffHours / 24);
      return `לפני ${diffDays} ימים`;
    } catch {
      return 'לאחרונה';
    }
  };

  const handleSingleRestore = (tx: Transaction) => {
    setJustRestoredId(tx.id);
    setTimeout(() => {
      onRestore(tx);
      setJustRestoredId(null);
    }, 250);
  };

  return (
    <div
      id="deleted-transactions-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="deleted-transactions-modal-container"
        className="bg-white dark:bg-[#1E2526] rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl border border-gray-200/80 dark:border-[#2D3636] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-[#2D3636] flex items-center justify-between gap-3 bg-gray-50/70 dark:bg-[#1A2021]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/40">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  סל שחזור תנועות
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {deletedTransactions.length} תנועות
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                מחקת תנועה בטעות? תוכל להחזיר אותה לכאן בכל רגע בלחיצה אחת.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A3435] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar & Search */}
        {deletedTransactions.length > 0 && (
          <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-[#2D3636] bg-white dark:bg-[#1E2526] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש בין התנועות שנמחקו..."
                className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-gray-50 dark:bg-[#252D2E] border border-gray-200 dark:border-[#3A4546] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-[#00B894]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onRestoreAll}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white text-xs font-bold transition-all shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>שחזר את כולן ({deletedTransactions.length})</span>
              </button>

              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-all"
                  title="ריקון הסל לצמיתות"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">רוקן סל</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 p-1 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-300 dark:border-rose-800">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 px-1">
                    בטוח?
                  </span>
                  <button
                    onClick={() => {
                      onClearTrash();
                      setShowClearConfirm(false);
                    }}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors"
                  >
                    כן, מחק הכל
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 bg-gray-200 dark:bg-[#333E40] text-gray-700 dark:text-gray-300 rounded-lg text-[11px] transition-colors"
                  >
                    ביטול
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5">
          {deletedTransactions.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-[#00B894] flex items-center justify-center mx-auto border border-emerald-200/60 dark:border-emerald-800/40">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                סל השחזור ריק
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                כל התנועות שלך שמורות ומאובטחות. בכל פעם שתמחק תנועה, היא תישמר כאן ותוכל להחזיר אותה בקלות בכל רגע.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              לא נמצאו תנועות התואמות לחיפוש "{searchTerm}"
            </div>
          ) : (
            filtered.map(({ transaction: tx, deletedAt }) => {
              const isRestoring = justRestoredId === tx.id;
              return (
                <div
                  key={`${tx.id}-${deletedAt}`}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isRestoring
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 opacity-60 scale-98'
                      : 'bg-white dark:bg-[#202728] border-gray-200/80 dark:border-[#2D3636] hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-[#00B894] dark:bg-[#00B894]/20'
                          : 'bg-gray-100 text-gray-600 dark:bg-[#293233] dark:text-gray-300'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5 text-[#00B894]" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-[#FF7675]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                          {tx.description}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#252D2E] text-gray-600 dark:text-gray-400 shrink-0 font-medium">
                          {tx.category}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>תאריך: {tx.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(deletedAt)}</span>
                        </span>
                        {tx.notes && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-[120px]">"{tx.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <div
                      className={`font-mono font-black text-xs sm:text-sm ${
                        tx.type === 'income' ? 'text-[#00B894]' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}₪{tx.amount.toLocaleString()}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSingleRestore(tx)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-[#00B894] border border-emerald-200/80 dark:border-emerald-800 text-xs font-bold transition-all shadow-2xs"
                        title="החזר תנועה זו לחשבון"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>שחזר</span>
                      </button>

                      <button
                        onClick={() => onPermanentlyDelete(tx.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-gray-100 dark:hover:bg-[#293233] transition-colors"
                        title="מחק לצמיתות מסל השחזור"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-[#2D3636] bg-gray-50/70 dark:bg-[#1A2021]/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700 dark:text-gray-300">טיפ מהיר:</span>
            <span>ניתן להקיש Ctrl+Z (או Cmd+Z) כדי לשחזר את התנועה האחרונה שנמחקה</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white dark:bg-[#252D2E] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
