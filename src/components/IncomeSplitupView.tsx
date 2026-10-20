import React, { useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Table2,
  Trash2,
} from './Icons';
import {
  formatINR,
  type CategorySplitItem,
  type FinancialSummary,
  type SourceSplitItem,
} from '../utils/finance';

interface IncomeSplitupViewProps {
  summary: FinancialSummary;
  incomeSplit: SourceSplitItem[];
  expenseSplit: CategorySplitItem[];
  onQuickLogToSource: (sourceId: string) => void;
  onDeleteEntry: (id: string) => void;
}

export const IncomeSplitupView: React.FC<IncomeSplitupViewProps> = ({
  summary,
  incomeSplit,
  expenseSplit,
  onQuickLogToSource,
  onDeleteEntry,
}) => {
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(
    incomeSplit[0]?.sourceId || 'src-stipend'
  );

  const activeIncomeSplit = incomeSplit.filter((s) => s.totalAmount > 0);
  const activeExpenseSplit = expenseSplit.filter((c) => c.totalAmount > 0);
  const maxSourceEarned = Math.max(1, ...incomeSplit.map((s) => s.totalAmount));

  // Calculate SVG Donut segments for active income sources
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <div className="space-y-6">
      {/* Section 1: Header & Stipend / Consulting Stream Cards */}
      <div className="space-y-4">
        <div className="px-1">
          <h1 className="font-display text-2xl font-bold text-[#141518]">
            Stipend &amp; Consulting Splitup
          </h1>
          <p className="text-xs text-[#5A5D65] mt-0.5">
            Breakdown of your two income streams, expenses deducted per stream, and net balance left in INR
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {incomeSplit.map((src) => (
            <div
              key={src.sourceId}
              className="rounded-3xl bg-white border border-black/10 p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: src.color }}
                    />
                    <h2 className="font-display text-lg font-bold text-[#141518]">
                      {src.name}
                    </h2>
                  </div>
                  <p className="text-xs text-[#5A5D65] mt-0.5">
                    {src.entryCount} {src.entryCount === 1 ? 'payout' : 'payouts'} ·{' '}
                    {src.percentageOfIncome}% of total earned
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onQuickLogToSource(src.sourceId)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#141518] hover:bg-[#272930] text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>+ Add {src.name}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/6">
                <div>
                  <span className="text-[11px] text-[#5A5D65] block">Earned</span>
                  <span className="font-mono-num text-sm sm:text-base font-bold text-[#047857]">
                    {formatINR(src.totalAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#5A5D65] block">Spent</span>
                  <span className="font-mono-num text-sm sm:text-base font-bold text-[#BE123C]">
                    {src.expensesFunded > 0 ? `-${formatINR(src.expensesFunded)}` : '₹0'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#5A5D65] block">Net Left</span>
                  <span className="font-mono-num text-sm sm:text-base font-bold text-[#141518]">
                    {formatINR(src.netBalance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Visual Graphs (Comparative Bar Graph + Donut Distribution) */}
      <section
        aria-label="Income sources visual graphs"
        className="rounded-3xl bg-white border border-black/10 p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-[#141518] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#10B981]" />
              <span>Stipend vs. Consulting Cashflow Graph</span>
            </h2>
            <p className="text-xs text-[#5A5D65] mt-0.5">
              Earned inflow compared against expenses deducted in INR
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#5A5D65]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" />
              Stipend
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]" />
              Consulting
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#F43F5E]" />
              Expenses Deducted
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: SVG Donut Chart */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#F6F5F0]">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#E5E2DC"
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
                  {formatINR(summary.totalEarned)}
                </span>
                <span className="text-[10px] text-[#047857] font-semibold mt-0.5">
                  {summary.retentionRatio}% kept
                </span>
              </div>
            </div>
          </div>

          {/* Right: Multi-Bar Comparative Graph */}
          <div className="lg:col-span-8 space-y-4">
            {incomeSplit.map((src) => {
              const earnedWidthPct =
                summary.totalEarned > 0 && src.totalAmount > 0
                  ? Math.max(4, Math.round((src.totalAmount / maxSourceEarned) * 100))
                  : 0;
              const spentWidthPct =
                src.totalAmount > 0
                  ? Math.min(100, Math.round((src.expensesFunded / maxSourceEarned) * 100))
                  : 0;

              return (
                <div key={src.sourceId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: src.color }}
                      />
                      <span className="font-semibold text-[#141518] truncate">{src.name}</span>
                      <span aria-hidden="true" className="text-black/30">·</span>
                      <span className="text-[#5A5D65] font-mono-num">{src.percentageOfIncome}%</span>
                    </div>
                    <div className="font-mono-num text-xs flex items-center gap-3 shrink-0">
                      <span className="font-bold text-[#141518]">{formatINR(src.totalAmount)}</span>
                      {src.expensesFunded > 0 && (
                        <span className="text-[#BE123C]">-{formatINR(src.expensesFunded)}</span>
                      )}
                    </div>
                  </div>

                  {/* Dual Horizontal Bar Graph (Earned vs Expenses Deducted) */}
                  <div className="h-3.5 w-full rounded-lg bg-[#F6F5F0] overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-300"
                      style={{
                        width: `${earnedWidthPct}%`,
                        backgroundColor: src.color,
                      }}
                    />
                    {spentWidthPct > 0 && (
                      <div
                        className="absolute top-0 left-0 h-full bg-[#F43F5E]/85 border-r-2 border-white"
                        style={{ width: `${spentWidthPct}%` }}
                        title={`Expenses funded: ${formatINR(src.expensesFunded)}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Structured Income Sources Splitup Table */}
      <section
        aria-label="Income sources splitup table"
        className="rounded-3xl bg-white border border-black/10 overflow-hidden"
      >
        <div className="p-6 pb-4 flex flex-wrap items-center justify-between gap-2 border-b border-black/6">
          <div>
            <h2 className="font-display text-lg font-bold text-[#141518] flex items-center gap-2">
              <Table2 className="w-5 h-5 text-[#10B981]" />
              <span>Income Sources Splitup Table</span>
            </h2>
            <p className="text-xs text-[#5A5D65] mt-0.5">
              Click Stipend or Consulting to inspect individual payouts or log a new inflow
            </p>
          </div>
          <span className="font-mono-num text-xs font-semibold text-[#141518]">
            Net Balance: {formatINR(summary.balanceLeft)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/8 bg-[#F6F5F0]/60 text-[11px] font-semibold text-[#5A5D65]">
                <th className="py-3.5 pl-6 pr-3">Income Source</th>
                <th className="py-3.5 px-3 text-right">Payouts</th>
                <th className="py-3.5 px-3 text-right">Total Earned</th>
                <th className="py-3.5 px-3 text-right">Expenses Funded</th>
                <th className="py-3.5 px-3 text-right">Net Retained</th>
                <th className="py-3.5 px-3 text-right">Share</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/6 text-xs">
              {incomeSplit.map((source) => {
                const isExpanded = expandedSourceId === source.sourceId;
                return (
                  <React.Fragment key={source.sourceId}>
                    <tr className="hover:bg-[#F6F5F0]/50 transition-colors">
                      <td className="py-3.5 pl-6 pr-3 font-bold text-[#141518]">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSourceId(isExpanded ? null : source.sourceId)
                          }
                          className="flex items-center gap-2.5 text-left cursor-pointer"
                        >
                          <span
                            className="w-3 h-3 rounded-xs shrink-0"
                            style={{ backgroundColor: source.color }}
                          />
                          <span>{source.name}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#5A5D65]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#5A5D65]" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono-num text-[#141518]">
                        {source.entryCount}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono-num font-bold text-[#047857] whitespace-nowrap">
                        {formatINR(source.totalAmount)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono-num text-[#BE123C] whitespace-nowrap">
                        {source.expensesFunded > 0 ? `-${formatINR(source.expensesFunded)}` : '₹0'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono-num font-bold text-[#141518] whitespace-nowrap">
                        {formatINR(source.netBalance)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono-num font-semibold text-[#141518] whitespace-nowrap">
                        {source.percentageOfIncome}%
                      </td>
                      <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onQuickLogToSource(source.sourceId)}
                          aria-label={`Add income to ${source.name}`}
                          className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#F6F5F0] hover:bg-[#EFECE6] text-xs font-semibold text-[#141518] inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>+ Log</span>
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-[#F6F5F0]/50">
                        <td colSpan={7} className="px-6 py-3.5">
                          <div className="space-y-2">
                            <p className="text-[11px] font-semibold text-[#5A5D65]">
                              Recorded Payouts for {source.name} ({source.entries.length})
                            </p>
                            {source.entries.length === 0 ? (
                              <p className="text-xs text-[#5A5D65]">
                                No payouts recorded for {source.name} yet.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {source.entries.map((entry) => (
                                  <div
                                    key={entry.id}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-black/6"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-[#141518] truncate">
                                        {entry.title}
                                      </p>
                                      <p className="text-[11px] text-[#5A5D65] font-mono-num">
                                        {entry.date} {entry.note ? `· ${entry.note}` : ''}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 pl-2">
                                      <span className="font-mono-num text-xs font-bold text-[#047857]">
                                        +{formatINR(entry.amount)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => onDeleteEntry(entry.id)}
                                        aria-label={`Delete ${entry.title}`}
                                        className="min-h-[32px] min-w-[32px] rounded-lg hover:bg-[#FFF1F2] text-[#5A5D65] hover:text-[#BE123C] flex items-center justify-center cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-black/10 bg-[#F6F5F0]/80 font-mono-num text-xs font-bold text-[#141518]">
                <td className="py-3.5 pl-6 pr-3 font-sans">Total (Stipend + Consulting)</td>
                <td className="py-3.5 px-3 text-right">{summary.incomeCount}</td>
                <td className="py-3.5 px-3 text-right text-[#047857]">
                  {formatINR(summary.totalEarned)}
                </td>
                <td className="py-3.5 px-3 text-right text-[#BE123C]">
                  {summary.totalSpent > 0 ? `-${formatINR(summary.totalSpent)}` : '₹0'}
                </td>
                <td className="py-3.5 px-3 text-right">{formatINR(summary.balanceLeft)}</td>
                <td className="py-3.5 px-3 text-right">
                  {summary.totalEarned > 0 ? '100%' : '0%'}
                </td>
                <td className="py-3.5 pl-3 pr-6" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Section 4: Structured Expense Categories Breakdown Table */}
      <section
        aria-label="Expense categories breakdown table"
        className="rounded-3xl bg-white border border-black/10 overflow-hidden"
      >
        <div className="p-6 pb-4 flex flex-wrap items-center justify-between gap-2 border-b border-black/6">
          <div>
            <h2 className="font-display text-lg font-bold text-[#141518]">
              Expense Categories Breakdown Table
            </h2>
            <p className="text-xs text-[#5A5D65] mt-0.5">
              Outflow distribution across categories and impact on total earned income
            </p>
          </div>
          <span className="font-mono-num text-xs font-bold text-[#BE123C]">
            Total Spent: {summary.totalSpent > 0 ? `-${formatINR(summary.totalSpent)}` : '₹0'}
          </span>
        </div>

        {activeExpenseSplit.length === 0 ? (
          <div className="p-8 text-center space-y-1">
            <p className="text-sm font-semibold text-[#141518]">No expenses recorded yet</p>
            <p className="text-xs text-[#5A5D65]">
              When you log expenses, their category breakdown will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/8 bg-[#F6F5F0]/60 text-[11px] font-semibold text-[#5A5D65]">
                  <th className="py-3.5 pl-6 pr-3">Expense Category</th>
                  <th className="py-3.5 px-3 text-right">Transactions</th>
                  <th className="py-3.5 px-3 text-right">% of Expenses</th>
                  <th className="py-3.5 px-3 text-right">% of Total Earned</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Amount Spent (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6 text-xs">
                {activeExpenseSplit.map((cat) => (
                  <tr key={cat.categoryId} className="hover:bg-[#F6F5F0]/50 transition-colors">
                    <td className="py-3.5 pl-6 pr-3 font-bold text-[#141518]">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-xs shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono-num text-[#5A5D65]">
                      {cat.entryCount}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono-num text-[#141518]">
                      {cat.percentageOfExpenses}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono-num text-[#5A5D65]">
                      {cat.percentageOfIncome}%
                    </td>
                    <td className="py-3.5 pl-3 pr-6 text-right font-mono-num font-bold text-[#BE123C] whitespace-nowrap">
                      -{formatINR(cat.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
