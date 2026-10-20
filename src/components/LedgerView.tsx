import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Trash2,
  Plus,
  Download,
  RotateCcw,
} from 'lucide-react';
import {
  formatINR,
  type ExpenseCategoryConfig,
  type IncomeSourceConfig,
  type LedgerEntry,
} from '../utils/finance';

interface LedgerViewProps {
  entries: LedgerEntry[];
  incomeSources: IncomeSourceConfig[];
  expenseCategories: ExpenseCategoryConfig[];
  onDeleteEntry: (id: string) => void;
  onOpenAddModal: (type: 'income' | 'expense') => void;
  onClearAllData: () => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  entries,
  incomeSources,
  expenseCategories,
  onDeleteEntry,
  onOpenAddModal,
  onClearAllData,
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

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Title', 'Income Source', 'Expense Category', 'Amount (INR)', 'Note'];
    const rows = filtered.map((e) => [
      e.date,
      e.type,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${sourceMap.get(e.sourceId)?.name || 'Stipend'}"`,
      `"${e.categoryId ? categoryMap.get(e.categoryId)?.name || '' : ''}"`,
      e.type === 'income' ? e.amount : -e.amount,
      `"${(e.note || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koko-vault-ledger-inr-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header & Filter Bar */}
      <div className="rounded-3xl bg-white border border-black/10 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#141518]">
              Transaction Ledger Table
            </h1>
            <p className="text-xs text-[#5A5D65] mt-0.5">
              Search, filter, or export all Stipend, Consulting, and Expense records in INR
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="min-h-[42px] px-3.5 py-2 rounded-2xl bg-[#F6F5F0] hover:bg-[#EFECE6] text-[#141518] text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={onClearAllData}
                className="min-h-[42px] px-3.5 py-2 rounded-2xl bg-[#F6F5F0] hover:bg-[#FFF1F2] text-[#5A5D65] hover:text-[#BE123C] text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenAddModal('income')}
              className="min-h-[42px] px-3.5 py-2 rounded-2xl bg-[#10B981] text-[#141518] text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Income</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAddModal('expense')}
              className="min-h-[42px] px-3.5 py-2 rounded-2xl bg-[#141518] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
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
              placeholder="Search title, Stipend, Consulting, or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] pl-9 pr-3.5 rounded-2xl bg-[#F6F5F0] border border-black/10 text-xs font-medium text-[#141518]"
            />
          </div>

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
                {t === 'all' ? 'All' : t === 'income' ? 'Income' : 'Expenses'}
              </button>
            ))}
          </div>

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

      {/* Structured Ledger Table */}
      <div className="rounded-3xl bg-white border border-black/10 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="font-display text-base font-bold text-[#141518]">
              No transactions recorded yet
            </p>
            <p className="text-xs text-[#5A5D65]">
              Tap &ldquo;Add Income&rdquo; to log a Stipend or Consulting payout, or &ldquo;Add Expense&rdquo; to record spending.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/8 bg-[#F6F5F0]/60 text-[11px] font-semibold text-[#5A5D65]">
                  <th className="py-3.5 pl-6 pr-3">Date</th>
                  <th className="py-3.5 px-3">Description</th>
                  <th className="py-3.5 px-3">Source</th>
                  <th className="py-3.5 px-3">Category / Note</th>
                  <th className="py-3.5 px-3 text-right">Amount (INR)</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6 text-xs">
                {filtered.map((entry) => {
                  const source = sourceMap.get(entry.sourceId);
                  const category = entry.categoryId ? categoryMap.get(entry.categoryId) : undefined;
                  const isIncome = entry.type === 'income';

                  return (
                    <tr key={entry.id} className="hover:bg-[#F6F5F0]/50 transition-colors">
                      <td className="py-3.5 pl-6 pr-3 font-mono-num text-[#5A5D65] whitespace-nowrap">
                        {entry.date}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#141518]">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-[#ECFDF5] text-[#047857]'
                                : 'bg-[#FFF1F2] text-[#BE123C]'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                          </span>
                          <span>{entry.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-[#141518] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-xs shrink-0"
                            style={{ backgroundColor: source?.color || '#10B981' }}
                          />
                          <span>{source?.name || 'Stipend'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-[#5A5D65]">
                        {category ? category.name : 'Income Inflow'}
                        {entry.note ? ` · ${entry.note}` : ''}
                      </td>
                      <td
                        className={`py-3.5 px-3 text-right font-mono-num font-bold whitespace-nowrap ${
                          isIncome ? 'text-[#047857]' : 'text-[#141518]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatINR(entry.amount)}
                      </td>
                      <td className="py-3.5 pl-3 pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteEntry(entry.id)}
                          aria-label={`Delete ${entry.title}`}
                          className="min-h-[38px] min-w-[38px] rounded-xl hover:bg-[#FFF1F2] text-[#5A5D65] hover:text-[#BE123C] inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
