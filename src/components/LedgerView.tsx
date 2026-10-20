import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  formatCurrency,
  type ExpenseCategoryConfig,
  type IncomeSourceConfig,
  type LedgerEntry,
} from '../utils/finance';

interface LedgerViewProps {
  entries: LedgerEntry[];
  incomeSources: IncomeSourceConfig[];
  expenseCategories: ExpenseCategoryConfig[];
  currencySymbol: string;
  onDeleteEntry: (id: string) => void;
  onOpenAddModal: (type: 'income' | 'expense') => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  entries,
  incomeSources,
  expenseCategories,
  currencySymbol,
  onDeleteEntry,
  onOpenAddModal,
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sourceMap = new Map<string, IncomeSourceConfig>(incomeSources.map((s) => [s.id, s]));
  const categoryMap = new Map<string, ExpenseCategoryConfig>(expenseCategories.map((c) => [c.id, c]));

  const filtered = entries
    .filter((entry) => {
      if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
      if (sourceFilter !== 'all' && entry.sourceId !== sourceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const srcName = sourceMap.get(entry.sourceId)?.name.toLowerCase() || '';
        const catName = entry.categoryId
          ? categoryMap.get(entry.categoryId)?.name.toLowerCase() || ''
          : '';
        return (
          entry.title.toLowerCase().includes(q) ||
          (entry.note && entry.note.toLowerCase().includes(q)) ||
          srcName.includes(q) ||
          catName.includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-5">
      {/* Header & Filter Bar */}
      <div className="rounded-3xl bg-white border border-black/10 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#141518]">
              Complete Activity Ledger
            </h1>
            <p className="text-xs text-[#5A5D65] mt-0.5">
              Inspect, filter, or remove individual salary inflows and expense entries.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenAddModal('income')}
              className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-[#10B981] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Salary</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAddModal('expense')}
              className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-[#141518] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-5 relative flex items-center">
            <Search className="w-4 h-4 text-[#5A5D65] absolute left-3.5 pointer-events-none" />
            <input
              type="search"
              aria-label="Search transactions"
              placeholder="Search title, source, or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] pl-9 pr-3.5 rounded-2xl bg-[#F6F5F0] border border-black/10 text-xs font-medium text-[#141518]"
            />
          </div>

          {/* Segmented Type Filter */}
          <div className="sm:col-span-4 flex items-center gap-1 p-1 bg-[#F6F5F0] rounded-2xl">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`flex-1 min-h-[36px] rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-white text-[#141518] shadow-xs'
                    : 'text-[#5A5D65] hover:text-[#141518]'
                }`}
              >
                {t === 'all' ? 'All' : t === 'income' ? 'Salaries' : 'Expenses'}
              </button>
            ))}
          </div>

          {/* Income Source Dropdown Filter */}
          <div className="sm:col-span-3">
            <select
              aria-label="Filter by income source"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-2xl bg-[#F6F5F0] border border-black/10 text-xs font-semibold text-[#141518]"
            >
              <option value="all">All Sources</option>
              {incomeSources.map((src) => (
                <option key={src.id} value={src.id}>
                  {src.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filtered Entries List */}
      <div className="rounded-3xl bg-white border border-black/10 divide-y divide-black/5 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="font-display text-base font-bold text-[#141518]">
              No matching entries found
            </p>
            <p className="text-xs text-[#5A5D65]">
              Try clearing your filter or add a new salary stream or expense.
            </p>
          </div>
        ) : (
          filtered.map((entry) => {
            const source = sourceMap.get(entry.sourceId);
            const category = entry.categoryId ? categoryMap.get(entry.categoryId) : undefined;
            const isIncome = entry.type === 'income';

            return (
              <div
                key={entry.id}
                className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-[#F6F5F0]/50 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-[#ECFDF5] text-[#047857]'
                        : 'bg-[#FFF1F2] text-[#BE123C]'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#141518] truncate">{entry.title}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#5A5D65] mt-0.5">
                      <span>{source?.name || 'Primary Pool'}</span>
                      {category && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{category.name}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">{entry.date}</span>
                      {entry.note && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[180px]">{entry.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`font-mono-num text-sm sm:text-base font-bold ${
                      isIncome ? 'text-[#047857]' : 'text-[#141518]'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(entry.amount, currencySymbol)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onDeleteEntry(entry.id)}
                    aria-label={`Delete ${entry.title}`}
                    className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-[#FFF1F2] text-[#5A5D65] hover:text-[#BE123C] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
