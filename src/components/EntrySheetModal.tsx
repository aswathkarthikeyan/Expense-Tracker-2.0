import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  validateLedgerInput,
  type ExpenseCategoryConfig,
  type IncomeSourceConfig,
  type LedgerEntry,
  type TransactionType,
} from '../utils/finance';

interface EntrySheetModalProps {
  isOpen: boolean;
  initialType: TransactionType;
  preselectedSourceId?: string;
  incomeSources: IncomeSourceConfig[];
  expenseCategories: ExpenseCategoryConfig[];
  onClose: () => void;
  onSaveEntry: (entry: Omit<LedgerEntry, 'id'>) => void;
}

export const EntrySheetModal: React.FC<EntrySheetModalProps> = ({
  isOpen,
  initialType,
  preselectedSourceId,
  incomeSources,
  expenseCategories,
  onClose,
  onSaveEntry,
}) => {
  const [entryType, setEntryType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [sourceId, setSourceId] = useState(
    preselectedSourceId || incomeSources[0]?.id || 'src-stipend'
  );
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || 'cat-housing');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEntryType(initialType);
      setTitle('');
      setAmountStr('');
      setSourceId(preselectedSourceId || incomeSources[0]?.id || 'src-stipend');
      setCategoryId(expenseCategories[0]?.id || 'cat-housing');
      setDate(new Date().toISOString().slice(0, 10));
      setNote('');
      setErrorMsg(null);
    }
  }, [isOpen, initialType, preselectedSourceId, incomeSources, expenseCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateLedgerInput({
      title,
      amountStr,
      sourceId,
      date,
    });
    if (!validation.valid || validation.parsedAmount === undefined) {
      setErrorMsg(validation.error || 'Please check your input fields.');
      return;
    }

    onSaveEntry({
      type: entryType,
      title: title.trim(),
      amount: validation.parsedAmount,
      date,
      sourceId,
      categoryId: entryType === 'expense' ? categoryId : undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-modal-title"
    >
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#F6F5F0] border border-black/10 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="w-10 h-1.5 bg-black/15 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-black/5">
          <div>
            <h2 id="entry-modal-title" className="font-display text-lg font-bold text-[#141518]">
              {entryType === 'income' ? 'Add Income (Stipend / Consulting)' : 'Log New Expense'}
            </h2>
            <p className="text-xs text-[#5A5D65]">
              {entryType === 'income'
                ? 'Choose Stipend or Consulting to update your INR splitup.'
                : 'Deducts immediately from your Balance Left.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] rounded-full bg-white border border-black/10 flex items-center justify-center text-[#141518] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#EFECE6] rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setEntryType('income');
                setErrorMsg(null);
              }}
              className={`min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                entryType === 'income'
                  ? 'bg-[#141518] text-white shadow-sm'
                  : 'text-[#5A5D65] hover:text-[#141518]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
              <span>Income</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEntryType('expense');
                setErrorMsg(null);
              }}
              className={`min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                entryType === 'expense'
                  ? 'bg-[#141518] text-white shadow-sm'
                  : 'text-[#5A5D65] hover:text-[#141518]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-[#F43F5E]" />
              <span>Expense</span>
            </button>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-2xl bg-[#FFF1F2] border border-[#F43F5E]/30 px-4 py-3 text-xs font-medium text-[#BE123C]"
            >
              {errorMsg}
            </div>
          )}

          <div>
            <label
              htmlFor="entry-amount-input"
              className="block text-xs font-semibold text-[#5A5D65] mb-1.5"
            >
              Amount (₹ INR)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-mono-num text-xl font-bold text-[#5A5D65]">
                ₹
              </span>
              <input
                id="entry-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full min-h-[54px] pl-10 pr-4 rounded-2xl bg-white border border-black/10 font-mono-num text-2xl font-bold text-[#141518] focus:outline-2 focus:outline-[#141518]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="entry-title-input"
              className="block text-xs font-semibold text-[#5A5D65] mb-1.5"
            >
              {entryType === 'income' ? 'Income Description' : 'Expense Title / Merchant'}
            </label>
            <input
              id="entry-title-input"
              type="text"
              placeholder={
                entryType === 'income'
                  ? 'e.g. Monthly Stipend, Client Consulting Payout'
                  : 'e.g. Rent, Groceries, Internet Bill'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-[48px] px-4 rounded-2xl bg-white border border-black/10 text-sm font-medium text-[#141518] focus:outline-2 focus:outline-[#141518]"
            />
          </div>

          <div>
            <label
              htmlFor="entry-source-select"
              className="block text-xs font-semibold text-[#5A5D65] mb-1.5"
            >
              {entryType === 'income'
                ? 'Income Source (Stipend or Consulting)'
                : 'Deduct From Source (Stipend or Consulting)'}
            </label>

            {/* Quick 2-Source Selector Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mb-2">
              {incomeSources.map((src) => {
                const isSelected = sourceId === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setSourceId(src.id)}
                    className={`min-h-[46px] px-3.5 py-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#141518] text-[#141518] ring-2 ring-[#141518]/15 shadow-xs'
                        : 'bg-white/60 border-black/10 text-[#5A5D65] hover:text-[#141518]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: src.color }}
                      />
                      <span>{src.name}</span>
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-semibold text-[#047857]">Selected</span>
                    )}
                  </button>
                );
              })}
            </div>

            <select
              id="entry-source-select"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="sr-only"
              aria-label="Income Source"
            >
              {incomeSources.map((src) => (
                <option key={src.id} value={src.id}>
                  {src.name}
                </option>
              ))}
            </select>
          </div>

          {entryType === 'expense' && (
            <div>
              <label
                htmlFor="entry-category-select"
                className="block text-xs font-semibold text-[#5A5D65] mb-1.5"
              >
                Expense Category
              </label>
              <select
                id="entry-category-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full min-h-[48px] px-4 rounded-2xl bg-white border border-black/10 text-sm font-medium text-[#141518] focus:outline-2 focus:outline-[#141518]"
              >
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="entry-date-input"
                className="block text-xs font-semibold text-[#5A5D65] mb-1.5"
              >
                Date
              </label>
              <input
                id="entry-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[48px] px-3.5 rounded-2xl bg-white border border-black/10 text-sm font-medium text-[#141518]"
              />
            </div>
            <div>
              <label
                htmlFor="entry-note-input"
                className="block text-xs font-semibold text-[#5A5D65] mb-1.5"
              >
                Optional Note
              </label>
              <input
                id="entry-note-input"
                type="text"
                placeholder="Client, invoice, or memo"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full min-h-[48px] px-3.5 rounded-2xl bg-white border border-black/10 text-sm text-[#141518]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full min-h-[52px] rounded-2xl font-semibold text-sm text-white shadow-md transition-transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 ${
                entryType === 'income'
                  ? 'bg-[#10B981] hover:bg-[#059669] text-[#141518]'
                  : 'bg-[#141518] hover:bg-[#272930]'
              }`}
            >
              {entryType === 'income' ? (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Save Income Entry</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Record Expense Entry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
