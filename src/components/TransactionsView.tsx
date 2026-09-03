import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CreditCard as CardIcon,
  Check,
} from 'lucide-react';
import {
  Transaction,
  Category,
  Account,
  CreditCard,
} from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  accounts: Account[];
  creditCards: CreditCard[];
  merchantRules: Record<string, string>;
  setMerchantRules: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onOpenAddModal: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  setTransactions,
  categories,
  setCategories,
  accounts,
  creditCards,
  merchantRules,
  setMerchantRules,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategoryTxId, setEditingCategoryTxId] = useState<string | null>(null);

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || tx.category === selectedCategory;
    const matchesType = selectedType === 'all' || tx.type === selectedType;
    return matchesSearch && matchesCat && matchesType;
  });

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleQuickChangeCategory = (tx: Transaction, newCat: string) => {
    // 1. Update this transaction
    setTransactions((prev) =>
      prev.map((t) => (t.id === tx.id ? { ...t, category: newCat } : t))
    );
    setEditingCategoryTxId(null);

    // 2. Smart merchant memory rule (Section 8 of prompt)
    // Extract first 1-2 words of description as merchant keyword
    const words = tx.description.trim().split(/\s+/);
    const keyword = words.slice(0, 2).join(' ');
    if (keyword.length >= 2) {
      setMerchantRules((prev) => ({
        ...prev,
        [keyword.toLowerCase()]: newCat,
      }));
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      iconName: 'Tag',
      color: 'emerald',
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCategoryName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D3436] dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#00B894]" />
            <span>ניהול תנועות וסיווג חכם</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            תנועות עו״ש וכרטיסי אשראי עם זיהוי בתי עסק ולמידת העדפות סיווג
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] hover:bg-[#E1E8E7] dark:hover:bg-[#2D3636] text-[#2D3436] dark:text-gray-200 text-xs font-bold border border-[#E1E8E7] dark:border-[#2D3636] transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>ניהול קטגוריות ({categories.length})</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>הוסף תנועה</span>
          </button>
        </div>
      </div>

      {/* Category Manager Drawer / Box */}
      {showCategoryManager && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E1E8E7] dark:border-[#2D3636] pb-3">
            <h2 className="text-sm font-bold text-[#2D3436] dark:text-white">
              מערכת קטגוריות וכללי סיווג חכמים
            </h2>
            <span className="text-xs text-gray-400">
              כל שינוי סיווג נלמד אוטומטית לעתיד
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-gray-200 text-xs font-medium border border-[#E1E8E7] dark:border-[#2D3636]"
              >
                <span>{cat.name}</span>
                {cat.isCustom && (
                  <span className="text-[10px] text-[#00B894] font-bold">אישי</span>
                )}
              </span>
            ))}
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md pt-2">
            <input
              type="text"
              placeholder="שם קטגוריה חדשה..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
            />
            <button
              type="submit"
              className="px-3.5 py-2 text-xs font-bold bg-[#00B894] text-white rounded-xl hover:bg-[#00A383] transition-colors"
            >
              הוסף קטגוריה
            </button>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="חיפוש לפי בית עסק, קטגוריה או הערה..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B894]"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white"
          >
            <option value="all">כל הקטגוריות</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e: any) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#E1E8E7] dark:border-[#2D3636] bg-[#F4F7F6] dark:bg-[#191D1E] text-[#2D3436] dark:text-white"
          >
            <option value="all">כל התנועות</option>
            <option value="expense">הוצאות בלבד</option>
            <option value="income">הכנסות בלבד</option>
          </select>
        </div>
      </div>

      {/* Transactions List Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#202728] border border-[#E1E8E7] dark:border-[#2D3636] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            נמצאו {filtered.length} תנועות
          </span>
          <span className="text-[11px] text-[#00B894] flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3" />
            <span>סיווג חכם פעיל</span>
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            לא נמצאו תנועות תואמות למסננים.
          </div>
        ) : (
          <div className="divide-y divide-[#E1E8E7] dark:divide-[#2D3636]">
            {filtered.map((tx) => {
              const isEditingCat = editingCategoryTxId === tx.id;
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs hover:bg-[#F4F7F6] dark:hover:bg-[#191D1E]/60 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-[#EBF7F5] text-[#00B894] dark:bg-[#00B894]/20'
                          : 'bg-[#F4F7F6] text-gray-600 dark:bg-[#191D1E] dark:text-gray-300'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5 text-[#00B894]" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-[#FF7675]" />
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-[#2D3436] dark:text-white text-sm">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-gray-400 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>{tx.date}</span>
                        <span>•</span>

                        {/* Interactive Category Selector with Smart Memory */}
                        {isEditingCat ? (
                          <div className="inline-flex items-center gap-1">
                            <select
                              defaultValue={tx.category}
                              onChange={(e) => handleQuickChangeCategory(tx, e.target.value)}
                              className="px-2 py-0.5 rounded border border-[#00B894] bg-white dark:bg-[#191D1E] text-[#2D3436] dark:text-white text-xs"
                            >
                              {categories.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setEditingCategoryTxId(null)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingCategoryTxId(tx.id)}
                            className="inline-flex items-center gap-1 font-bold text-[#00B894] bg-[#EBF7F5] dark:bg-[#00B894]/20 px-2 py-0.5 rounded hover:bg-[#D7F1EC] transition-colors"
                            title="לחץ לשינוי סיווג (המערכת תזכור זאת לעתיד)"
                          >
                            <span>{tx.category}</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        )}

                        {tx.creditCardId && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <CardIcon className="w-3 h-3" />
                              <span>אשראי</span>
                            </span>
                          </>
                        )}

                        {tx.installments && (
                          <span className="bg-[#FFF9EB] text-[#D6A317] dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                            תשלום {tx.installments.current}/{tx.installments.total}
                          </span>
                        )}

                        {tx.familyMember && (
                          <span className="bg-[#F4F7F6] dark:bg-[#191D1E] px-1.5 py-0.2 rounded text-[10px] text-gray-600 dark:text-gray-400">
                            {tx.familyMember}
                          </span>
                        )}

                        {tx.notes && <span className="italic text-gray-400">"{tx.notes}"</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`font-mono font-black text-base ${
                        tx.type === 'income' ? 'text-[#00B894]' : 'text-[#2D3436] dark:text-white'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}₪{tx.amount.toLocaleString()}
                    </div>

                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-gray-400 hover:text-[#FF7675] p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#191D1E] transition-colors"
                      title="מחק תנועה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
