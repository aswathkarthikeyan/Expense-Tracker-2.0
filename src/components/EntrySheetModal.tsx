import React, { useState, useEffect } from 'react';
import { Plus, X, ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';
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
  currencySymbol: string;
  onClose: () => void;
  onSaveEntry: (entry: Omit<LedgerEntry, 'id'>) => void;
  onAddCustomSource: (source: IncomeSourceConfig) => void;
}

const SOURCE_COLOR_SWATCHES = [
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#F59E0B',
  '#EC4899',
  '#14B8A6',
  '#F43F5E',
];

export const EntrySheetModal: React.FC<EntrySheetModalProps> = ({
  isOpen,
  initialType,
  preselectedSourceId,
  incomeSources,
  expenseCategories,
  currencySymbol,
  onClose,
  onSaveEntry,
  onAddCustomSource,
}) => {
  const [entryType, setEntryType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [sourceId, setSourceId] = useState(preselectedSourceId || incomeSources[0]?.id || 'src-salary');
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || 'cat-housing');
  const [date, setDate] = useState('2026-10-20');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inline custom income source creator state
  const [showNewSourceForm, setShowNewSourceForm] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceTag, setNewSourceTag] = useState('Side Stream');
  const [newSourceColor, setNewSourceColor] = useState(SOURCE_COLOR_SWATCHES[0]);

  useEffect(() => {
    if (isOpen) {
      setEntryType(initialType);
      setTitle('');
      setAmountStr('');
      setSourceId(preselectedSourceId || incomeSources[0]?.id || 'src-salary');
      setCategoryId(expenseCategories[0]?.id || 'cat-housing');
      setDate('2026-10-20');
      setNote('');
      setErrorMsg(null);
      setShowNewSourceForm(false);
    }
  }, [isOpen, initialType, preselectedSourceId, incomeSources, expenseCategories]);

  if (!isOpen) return null;

  const handleCreateCustomSource = () => {
    const trimmed = newSourceName.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a name for the new income source.');
      return;
    }
    const created: IncomeSourceConfig = {
      id: `src-custom-${Date.now()}`,
      name: trimmed,
      tag: newSourceTag.trim() || 'Custom',
      color: newSourceColor,
    };
    onAddCustomSource(created);
    setSourceId(created.id);
    setNewSourceName('');
    setShowNewSourceForm(false);
    setErrorMsg(null);
  };

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
        {/* iOS 27 Grab Handle */}
        <div className="w-10 h-1.5 bg-black/15 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-black/5">
          <div>
            <h2 id="entry-modal-title" className="font-display text-lg font-bold text-[#141518]">
              {entryType === 'income' ? 'Add Salary / Income Stream' : 'Log New Expense'}
            </h2>
            <p className="text-xs text-[#5A5D65]">
              {entryType === 'income'
                ? 'Tag the exact income source to update your splitup.'
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Segmented Mode Switcher */}
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
              <span>Salary / Income</span>
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

          {/* Amount Input */}
          <div>
            <label
              htmlFor="entry-amount-input"
              className="block text-xs font-semibold text-[#5A5D65] mb-1.5"
            >
              Amount ({currencySymbol})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-mono-num text-xl font-bold text-[#5A5D65]">
                {currencySymbol}
              </span>
              <input
                id="entry-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full min-h-[54px] pl-10 pr-4 rounded-2xl bg-white border border-black/10 font-mono-num text-2xl font-bold text-[#141518] focus:outline-2 focus:outline-[#141518]"
              />
            </div>
          </div>

          {/* Title / Description Input */}
          <div>
            <label
              htmlFor="entry-title-input"
              className="block text-xs font-semibold text-[#5A5D65] mb-1.5"
            >
              {entryType === 'income' ? 'Payout Title / Description' : 'Expense Title / Merchant'}
            </label>
            <input
              id="entry-title-input"
              type="text"
              placeholder={
                entryType === 'income'
                  ? 'e.g. October Tech Salary, Design Retainer, Dividend'
                  : 'e.g. Studio Rent, Coffee & Lunch, Cloud Server'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-[48px] px-4 rounded-2xl bg-white border border-black/10 text-sm font-medium text-[#141518] focus:outline-2 focus:outline-[#141518]"
            />
          </div>

          {/* Income Source Selector (Primary for Income, Funding Pool for Expense) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="entry-source-select"
                className="block text-xs font-semibold text-[#5A5D65]"
              >
                {entryType === 'income'
                  ? 'Income Source (Multiple Incomes Splitup)'
                  : 'Deduct From Income Source'}
              </label>
              {!showNewSourceForm && (
                <button
                  type="button"
                  onClick={() => setShowNewSourceForm(true)}
                  className="text-xs font-semibold text-[#047857] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Source</span>
                </button>
              )}
            </div>

            {showNewSourceForm ? (
              <div className="p-4 rounded-2xl bg-white border border-black/15 space-y-3 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#141518]">Create New Income Source</span>
                  <button
                    type="button"
                    onClick={() => setShowNewSourceForm(false)}
                    className="text-xs text-[#5A5D65] hover:text-[#141518]"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  aria-label="New income source name"
                  placeholder="e.g. YouTube AdSense, Consulting, Rental"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F6F5F0] border border-black/10 text-sm text-[#141518]"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {SOURCE_COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        onClick={() => setNewSourceColor(swatch)}
                        aria-label={`Select color ${swatch}`}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                          newSourceColor === swatch ? 'scale-110 ring-2 ring-[#141518]' : ''
                        }`}
                        style={{ backgroundColor: swatch }}
                      >
                        {newSourceColor === swatch && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateCustomSource}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#141518] text-white text-xs font-semibold cursor-pointer"
                  >
                    Save Source
                  </button>
                </div>
              </div>
            ) : null}

            <select
              id="entry-source-select"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full min-h-[48px] px-4 rounded-2xl bg-white border border-black/10 text-sm font-medium text-[#141518] focus:outline-2 focus:outline-[#141518]"
            >
              {incomeSources.map((src) => (
                <option key={src.id} value={src.id}>
                  {src.name} ({src.tag})
                </option>
              ))}
            </select>
          </div>

          {/* Expense Category Selector (Only when logging an Expense) */}
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

          {/* Date & Optional Note Row */}
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
                placeholder="Tax note, client, or memo"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full min-h-[48px] px-3.5 rounded-2xl bg-white border border-black/10 text-sm text-[#141518]"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full min-h-[52px] rounded-2xl font-semibold text-sm text-white shadow-md transition-transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 ${
                entryType === 'income'
                  ? 'bg-[#10B981] hover:bg-[#059669]'
                  : 'bg-[#141518] hover:bg-[#272930]'
              }`}
            >
              {entryType === 'income' ? (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Save Salary / Income Entry</span>
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
