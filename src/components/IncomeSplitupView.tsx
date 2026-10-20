import React, { useState } from 'react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Layers,
  PieChart,
  Trash2,
} from 'lucide-react';
import {
  formatCurrency,
  type CategorySplitItem,
  type FinancialSummary,
  type IncomeSourceConfig,
  type SourceSplitItem,
} from '../utils/finance';

interface IncomeSplitupViewProps {
  summary: FinancialSummary;
  incomeSplit: SourceSplitItem[];
  expenseSplit: CategorySplitItem[];
  incomeSources: IncomeSourceConfig[];
  currencySymbol: string;
  onQuickLogToSource: (sourceId: string) => void;
  onAddCustomSource: (source: IncomeSourceConfig) => void;
  onDeleteEntry: (id: string) => void;
}

const SWATCH_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6'];

export const IncomeSplitupView: React.FC<IncomeSplitupViewProps> = ({
  summary,
  incomeSplit,
  expenseSplit,
  currencySymbol,
  onQuickLogToSource,
  onAddCustomSource,
  onDeleteEntry,
}) => {
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(
    incomeSplit.find((s) => s.totalAmount > 0)?.sourceId || null
  );
  const [showAddSourcePanel, setShowAddSourcePanel] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customTag, setCustomTag] = useState('Side Stream');
  const [customColor, setCustomColor] = useState(SWATCH_COLORS[2]);

  const activeIncomeSplit = incomeSplit.filter((s) => s.totalAmount > 0);
  const inactiveIncomeSplit = incomeSplit.filter((s) => s.totalAmount === 0);

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddCustomSource({
      id: `src-${Date.now()}`,
      name: customName.trim(),
      tag: customTag.trim() || 'Custom',
      color: customColor,
    });
    setCustomName('');
    setShowAddSourcePanel(false);
  };

  // Calculate SVG Donut segments for active income sources
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <div className="space-y-6">
      {/* Header & Summary Banner */}
      <div className="rounded-3xl bg-white border border-black/10 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#5A5D65]">
              <span>Multi-Income Architecture</span>
              <span aria-hidden="true">·</span>
              <span>{summary.activeSourcesCount} Active Streams</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#141518] mt-1">
              Income Sources Splitup
            </h1>
            <p className="text-xs sm:text-sm text-[#5A5D65] mt-1 max-w-xl">
              Every paycheck, retainer, side project, and yield stream broken down by share of your{' '}
              <span className="font-mono-num font-semibold text-[#141518]">
                {formatCurrency(summary.totalEarned, currencySymbol)}
              </span>{' '}
              total earned.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddSourcePanel((prev) => !prev)}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-[#141518] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#272930] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-[#10B981]" />
            <span>Add Income Stream</span>
          </button>
        </div>

        {/* Inline Add New Income Stream Form */}
        {showAddSourcePanel && (
          <form
            onSubmit={handleCreateSource}
            className="mt-5 p-4 rounded-2xl bg-[#F6F5F0] border border-black/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#141518]">
                Register a New Income Source
              </span>
              <button
                type="button"
                onClick={() => setShowAddSourcePanel(false)}
                className="text-xs text-[#5A5D65] hover:text-[#141518]"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="new-source-name" className="block text-xs text-[#5A5D65] mb-1">
                  Source Name
                </label>
                <input
                  id="new-source-name"
                  type="text"
                  required
                  placeholder="e.g. App Store Revenue, Advisory"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-white border border-black/10 text-sm text-[#141518]"
                />
              </div>
              <div>
                <label htmlFor="new-source-tag" className="block text-xs text-[#5A5D65] mb-1">
                  Stream Type
                </label>
                <input
                  id="new-source-tag"
                  type="text"
                  placeholder="e.g. Passive, Freelance, Salary"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-white border border-black/10 text-sm text-[#141518]"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {SWATCH_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCustomColor(color)}
                    aria-label={`Pick color ${color}`}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      customColor === color ? 'scale-110 ring-2 ring-[#141518]' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#10B981] text-white text-xs font-semibold cursor-pointer"
              >
                Create Stream
              </button>
            </div>
          </form>
        )}

        {/* Visual Multi-Source Ring & Stacked Proportion Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-5 border-t border-black/5">
          {/* SVG Donut Chart */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#EFECE6"
                  strokeWidth="16"
                />
                {activeIncomeSplit.map((src) => {
                  const strokeDasharray = `${
                    (src.percentageOfIncome / 100) * circumference
                  } ${circumference}`;
                  const strokeDashoffset = -((cumulativePercent / 100) * circumference);
                  cumulativePercent += src.percentageOfIncome;
                  return (
                    <circle
                      key={src.sourceId}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="transparent"
                      stroke={src.color}
                      strokeWidth="16"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="butt"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                <span className="text-[11px] font-medium text-[#5A5D65]">Total Earned</span>
                <span className="font-mono-num text-sm font-bold text-[#141518]">
                  {formatCurrency(summary.totalEarned, currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Stacked Bar & Top Source Highlights */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-[#5A5D65] mb-2">
                <span>Proportional Source Distribution</span>
                <span className="font-mono-num font-semibold text-[#141518]">100% Portfolio</span>
              </div>
              <div className="h-4 w-full rounded-full bg-[#EFECE6] overflow-hidden flex p-0.5 gap-0.5">
                {activeIncomeSplit.length > 0 ? (
                  activeIncomeSplit.map((item) => (
                    <div
                      key={item.sourceId}
                      style={{
                        width: `${Math.max(item.percentageOfIncome, 3)}%`,
                        backgroundColor: item.color,
                      }}
                      className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                      title={`${item.name}: ${item.percentageOfIncome}%`}
                    />
                  ))
                ) : (
                  <div className="h-full w-full bg-black/10 rounded-full" />
                )}
              </div>
            </div>

            {/* Compact Legend Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeIncomeSplit.map((item) => (
                <div
                  key={item.sourceId}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F5F0] border border-black/5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#141518] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#5A5D65]">
                        {item.tag} · {item.entryCount} {item.entryCount === 1 ? 'payout' : 'payouts'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <p className="font-mono-num text-xs font-bold text-[#141518]">
                      {formatCurrency(item.totalAmount, currencySymbol)}
                    </p>
                    <p className="font-mono-num text-[11px] font-semibold text-[#047857]">
                      {item.percentageOfIncome}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Per-Source Splitup Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-lg font-bold text-[#141518] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#10B981]" />
            <span>Income Stream Breakdown ({incomeSplit.length})</span>
          </h2>
          <span className="text-xs text-[#5A5D65]">Tap any stream to inspect payouts</span>
        </div>

        {incomeSplit.map((source) => {
          const isExpanded = expandedSourceId === source.sourceId;
          return (
            <div
              key={source.sourceId}
              className="rounded-3xl bg-white border border-black/10 overflow-hidden transition-all"
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSourceId(isExpanded ? null : source.sourceId)
                  }
                  className="flex-1 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-mono-num text-xs font-bold shrink-0"
                      style={{ backgroundColor: source.color }}
                    >
                      {Math.round(source.percentageOfIncome)}%
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-[#141518] truncate">
                        {source.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#5A5D65] mt-0.5">
                        <span>{source.tag}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {source.entryCount} {source.entryCount === 1 ? 'entry' : 'entries'}
                        </span>
                        {source.entryCount > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-num">
                              Avg {formatCurrency(source.averageEntry, currencySymbol)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pl-3">
                    <div className="text-right">
                      <p className="font-mono-num text-base sm:text-lg font-bold text-[#141518]">
                        {formatCurrency(source.totalAmount, currencySymbol)}
                      </p>
                      <p className="font-mono-num text-xs text-[#5A5D65]">
                        {source.percentageOfIncome}% of total earned
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#5A5D65]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#5A5D65]" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onQuickLogToSource(source.sourceId)}
                  aria-label={`Add income to ${source.name}`}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F6F5F0] hover:bg-[#EFECE6] text-xs font-semibold text-[#141518] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
                  <span>+ Log Payout</span>
                </button>
              </div>

              {/* Progress bar inside source card */}
              <div className="px-5 pb-4">
                <div className="h-2 w-full rounded-full bg-[#F6F5F0] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${source.percentageOfIncome}%`,
                      backgroundColor: source.color,
                    }}
                  />
                </div>
              </div>

              {/* Expanded Entries List */}
              {isExpanded && (
                <div className="bg-[#F6F5F0]/70 border-t border-black/5 px-5 py-4 space-y-2.5">
                  {source.entries.length === 0 ? (
                    <div className="flex items-center justify-between py-2 text-xs text-[#5A5D65]">
                      <span>No payouts recorded for {source.name} in this period yet.</span>
                      <button
                        type="button"
                        onClick={() => onQuickLogToSource(source.sourceId)}
                        className="font-semibold text-[#047857] underline cursor-pointer"
                      >
                        Add first payout
                      </button>
                    </div>
                  ) : (
                    source.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white border border-black/5"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#141518] truncate">{entry.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-[#5A5D65] mt-0.5">
                            <span className="font-mono-num">{entry.date}</span>
                            {entry.note && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="truncate">{entry.note}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pl-2">
                          <span className="font-mono-num text-xs font-bold text-[#047857]">
                            +{formatCurrency(entry.amount, currencySymbol)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteEntry(entry.id)}
                            aria-label={`Delete ${entry.title}`}
                            className="min-h-[36px] min-w-[36px] rounded-xl hover:bg-[#FFF1F2] text-[#5A5D65] hover:text-[#BE123C] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {inactiveIncomeSplit.length > 0 && activeIncomeSplit.length > 0 && (
          <p className="text-xs text-[#5A5D65] px-2">
            {inactiveIncomeSplit.length} configured income{' '}
            {inactiveIncomeSplit.length === 1 ? 'source has' : 'sources have'} $0 logged in the
            selected period.
          </p>
        )}
      </div>

      {/* Expense Category Splitup & Net Retention Comparison */}
      <div className="rounded-3xl bg-white border border-black/10 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#141518] flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#F43F5E]" />
              <span>Where Expenses Go vs. Total Earned</span>
            </h2>
            <p className="text-xs text-[#5A5D65] mt-0.5">
              Outflow split across categories compared against your{' '}
              {formatCurrency(summary.totalEarned, currencySymbol)} total income.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#5A5D65]">Total Spent</span>
            <p className="font-mono-num text-base font-bold text-[#BE123C]">
              -{formatCurrency(summary.totalSpent, currencySymbol)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {expenseSplit
            .filter((c) => c.totalAmount > 0)
            .map((cat) => (
              <div
                key={cat.categoryId}
                className="p-4 rounded-2xl bg-[#F6F5F0] border border-black/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4" style={{ color: cat.color }} />
                    <span className="text-xs font-bold text-[#141518]">{cat.name}</span>
                  </div>
                  <span className="font-mono-num text-xs font-bold text-[#141518]">
                    {formatCurrency(cat.totalAmount, currencySymbol)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${cat.percentageOfExpenses}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#5A5D65]">
                  <span>
                    {cat.entryCount} {cat.entryCount === 1 ? 'expense' : 'expenses'}
                  </span>
                  <span className="font-mono-num">{cat.percentageOfExpenses}% of outflow</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
