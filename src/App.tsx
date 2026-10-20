/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  PieChart,
  ReceiptText,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_SOURCES,
  INITIAL_SEED_ENTRIES,
  computeExpenseSplitup,
  computeFinancialSummary,
  computeIncomeSplitup,
  formatINR,
  getMascotState,
  type LedgerEntry,
  type TransactionType,
} from './utils/finance';
import { KokoMascot } from './components/KokoMascot';
import { EntrySheetModal } from './components/EntrySheetModal';
import { IncomeSplitupView } from './components/IncomeSplitupView';
import { LedgerView } from './components/LedgerView';

type ActiveTab = 'home' | 'splitup' | 'ledger';

const STORAGE_KEY_ENTRIES = 'koko_clean_entries_v3';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  const [entries, setEntries] = useState<LedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENTRIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to empty initial entries
    }
    return INITIAL_SEED_ENTRIES;
  });

  const incomeSources = DEFAULT_INCOME_SOURCES;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<TransactionType>('income');
  const [modalPreselectedSourceId, setModalPreselectedSourceId] = useState<string | undefined>(
    undefined
  );
  const [justAddedType, setJustAddedType] = useState<TransactionType | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
    } catch {
      // Ignore storage quota errors
    }
  }, [entries]);

  const summary = useMemo(
    () =>
      computeFinancialSummary(
        entries,
        incomeSources,
        DEFAULT_EXPENSE_CATEGORIES
      ),
    [entries, incomeSources]
  );

  const incomeSplit = useMemo(
    () => computeIncomeSplitup(entries, incomeSources),
    [entries, incomeSources]
  );

  const expenseSplit = useMemo(
    () => computeExpenseSplitup(entries, DEFAULT_EXPENSE_CATEGORIES),
    [entries]
  );

  const mascotState = useMemo(
    () => getMascotState(summary, justAddedType),
    [summary, justAddedType]
  );

  const sourceMap = useMemo(
    () => new Map(incomeSources.map((s) => [s.id, s])),
    [incomeSources]
  );

  const categoryMap = useMemo(
    () => new Map(DEFAULT_EXPENSE_CATEGORIES.map((c) => [c.id, c])),
    []
  );

  const handleOpenAddModal = (type: TransactionType, preselectedSource?: string) => {
    setModalInitialType(type);
    setModalPreselectedSourceId(preselectedSource);
    setIsModalOpen(true);
  };

  const handleSaveEntry = (newEntryData: Omit<LedgerEntry, 'id'>) => {
    const created: LedgerEntry = {
      ...newEntryData,
      id: `ent-${Date.now()}`,
    };
    setEntries((prev) => [created, ...prev]);
    setJustAddedType(created.type);
    setTimeout(() => setJustAddedType(null), 4000);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const recentEntries = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [entries]
  );

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#141518] pb-24 lg:pb-12">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#F6F5F0]/90 backdrop-blur-md border-b border-black/8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-14">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('home');
            }}
            className="font-display text-lg font-bold tracking-tight text-[#141518] whitespace-nowrap shrink-0"
          >
            Koko Vault
          </a>

          {/* Zone 2: Clean single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5A5D65]"
          >
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`hover:text-[#141518] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'home'
                  ? 'text-[#141518] font-semibold underline decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('splitup')}
              className={`hover:text-[#141518] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'splitup'
                  ? 'text-[#141518] font-semibold underline decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              Splitup &amp; Tables
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              className={`hover:text-[#141518] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'ledger'
                  ? 'text-[#141518] font-semibold underline decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              Ledger
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleOpenAddModal('income')}
              className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-[#141518] rounded-xl hover:bg-[#272930] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              + Add Income
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Workspace Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Left/Center Column */}
            <div className="lg:col-span-7 space-y-5">
              {/* Dominant Visual Anchor: Simple Total Earned & Balance Left Card */}
              <section
                aria-label="Total earned and balance left summary"
                className="rounded-3xl bg-[#141518] text-white p-6 sm:p-7 shadow-sm space-y-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-white/65">
                      Balance Left After Expenses
                    </p>
                    <h1
                      data-testid="hero-balance-left"
                      className="font-display font-mono-num text-4xl sm:text-5xl font-bold tracking-tight mt-1 text-white"
                    >
                      {formatINR(summary.balanceLeft)}
                    </h1>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-[#34D399]">
                      {summary.retentionRatio}% kept
                    </span>
                    <p className="text-[11px] text-white/55 mt-0.5">
                      {summary.spentRatio}% spent
                    </p>
                  </div>
                </div>

                {/* Tactile Balance Retention Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-2.5 w-full rounded-full bg-white/12 overflow-hidden flex">
                    <div
                      className="h-full bg-[#10B981] transition-all duration-300"
                      style={{ width: `${summary.retentionRatio}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/60">
                    <span>Stipend &amp; Consulting Cushion</span>
                    <span>
                      {summary.incomeCount} {summary.incomeCount === 1 ? 'inflow' : 'inflows'} ·{' '}
                      {summary.expenseCount} {summary.expenseCount === 1 ? 'expense' : 'expenses'}
                    </span>
                  </div>
                </div>

                {/* Two Core Figures: Total Earned & Total Expenses */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-white/65">
                      <ArrowUpRight className="w-4 h-4 text-[#34D399]" />
                      <span>Total Earned</span>
                    </div>
                    <p
                      data-testid="hero-total-earned"
                      className="font-mono-num text-xl sm:text-2xl font-bold text-white mt-1"
                    >
                      {formatINR(summary.totalEarned)}
                    </p>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      Stipend + Consulting
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-white/65">
                      <ArrowDownRight className="w-4 h-4 text-[#FB7185]" />
                      <span>Expenses Spent</span>
                    </div>
                    <p
                      data-testid="hero-total-spent"
                      className="font-mono-num text-xl sm:text-2xl font-bold text-white/90 mt-1"
                    >
                      {formatINR(summary.totalSpent)}
                    </p>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      Deducted from total earned
                    </p>
                  </div>
                </div>

                {/* Primary Thumb-Zone Quick Actions */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal('income')}
                    className="min-h-[48px] px-4 py-3 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-[#141518] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Income</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAddModal('expense')}
                    className="min-h-[48px] px-4 py-3 rounded-2xl bg-white/12 hover:bg-white/18 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Expense</span>
                  </button>
                </div>
              </section>

              {/* Reactive Mascot Card ("Koko") */}
              <KokoMascot
                mood={mascotState.mood}
                headline={mascotState.headline}
                subline={mascotState.subline}
                badgeText={mascotState.badgeText}
                summary={summary}
                onQuickAddIncome={() => handleOpenAddModal('income')}
                onOpenSplitup={() => setActiveTab('splitup')}
              />

              {/* Recent Activity Feed on Homescreen */}
              <section
                aria-label="Recent cashflow activity"
                className="rounded-3xl bg-white border border-black/10 p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-[#141518]">
                      Recent Cashflow Activity
                    </h2>
                    <p className="text-xs text-[#5A5D65]">
                      Latest Stipend, Consulting, and Expense entries in INR
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ledger')}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#141518] hover:bg-[#F6F5F0] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>See All ({entries.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {recentEntries.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-sm font-semibold text-[#141518]">No transactions recorded yet</p>
                    <p className="text-xs text-[#5A5D65]">
                      Tap &ldquo;Add Income&rdquo; to log your Stipend or Consulting payout, or &ldquo;Add Expense&rdquo; to record spending.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-black/6">
                    {recentEntries.map((entry) => {
                      const isIncome = entry.type === 'income';
                      const src = sourceMap.get(entry.sourceId);
                      const cat = entry.categoryId ? categoryMap.get(entry.categoryId) : undefined;

                      return (
                        <div
                          key={entry.id}
                          className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
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
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-[#141518] truncate">
                                {entry.title}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-[#5A5D65] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                <span className="font-medium text-[#141518]/80 shrink-0">
                                  {src?.name || 'Stipend'}
                                </span>
                                {cat && (
                                  <>
                                    <span aria-hidden="true" className="shrink-0">·</span>
                                    <span className="truncate">{cat.name}</span>
                                  </>
                                )}
                                <span aria-hidden="true" className="shrink-0">·</span>
                                <span className="font-mono-num shrink-0">{entry.date}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`font-mono-num text-xs sm:text-sm font-bold ${
                                isIncome ? 'text-[#047857]' : 'text-[#141518]'
                              }`}
                            >
                              {isIncome ? '+' : '-'}
                              {formatINR(entry.amount)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(entry.id)}
                              aria-label={`Delete ${entry.title}`}
                              className="min-h-[40px] min-w-[40px] rounded-xl text-[#5A5D65] hover:text-[#BE123C] hover:bg-[#FFF1F2] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Stipend & Consulting Splitup Summary Table & Quick Log */}
            <aside className="lg:col-span-5 space-y-5">
              <div className="rounded-3xl bg-white border border-black/10 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#5A5D65]">
                      <span>Income Sources</span>
                      <span aria-hidden="true">·</span>
                      <span>Stipend &amp; Consulting</span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-[#141518] mt-0.5">
                      Income Splitup Summary
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('splitup')}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#F6F5F0] hover:bg-[#EFECE6] text-xs font-semibold text-[#141518] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>Graphs &amp; Tables</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Log Buttons for Stipend & Consulting */}
                <div className="grid grid-cols-2 gap-2.5">
                  {incomeSources.map((src) => (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => handleOpenAddModal('income', src.id)}
                      className="min-h-[44px] px-3 py-2.5 rounded-2xl bg-[#F6F5F0] hover:bg-[#EFECE6] text-xs font-bold text-[#141518] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: src.color }}
                        />
                        <span>+ {src.name}</span>
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#047857]" />
                    </button>
                  ))}
                </div>

                {/* Source Summary Table (Always shows Stipend and Consulting) */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-black/8 text-[11px] font-semibold text-[#5A5D65]">
                        <th className="py-2 pr-2">Source</th>
                        <th className="py-2 px-2 text-right">Earned</th>
                        <th className="py-2 px-2 text-right">Net Left</th>
                        <th className="py-2 pl-2 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/6">
                      {incomeSplit.map((src) => (
                        <tr key={src.sourceId}>
                          <td className="py-3 pr-2 font-semibold text-[#141518]">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-xs shrink-0"
                                style={{ backgroundColor: src.color }}
                              />
                              <span>{src.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-mono-num font-bold text-[#047857] whitespace-nowrap">
                            {formatINR(src.totalAmount)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono-num font-semibold text-[#141518] whitespace-nowrap">
                            {formatINR(src.netBalance)}
                          </td>
                          <td className="py-3 pl-2 text-right font-mono-num font-semibold text-[#5A5D65] whitespace-nowrap">
                            {src.percentageOfIncome}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('splitup')}
                  className="w-full min-h-[44px] rounded-2xl border border-black/15 text-xs font-semibold text-[#141518] hover:bg-[#F6F5F0] transition-colors cursor-pointer"
                >
                  Open Full Splitup Graphs &amp; Tables
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* SPLITUP & TABLES TAB */}
        {activeTab === 'splitup' && (
          <IncomeSplitupView
            summary={summary}
            incomeSplit={incomeSplit}
            expenseSplit={expenseSplit}
            onQuickLogToSource={(sourceId) => handleOpenAddModal('income', sourceId)}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {/* LEDGER TAB */}
        {activeTab === 'ledger' && (
          <LedgerView
            entries={entries}
            incomeSources={incomeSources}
            expenseCategories={DEFAULT_EXPENSE_CATEGORIES}
            onDeleteEntry={handleDeleteEntry}
            onOpenAddModal={(type) => handleOpenAddModal(type)}
            onClearAllData={() => setEntries([])}
          />
        )}
      </main>

      {/* Fixed Bottom Thumb-Zone Tab Bar for Mobile Viewports */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-black/10"
      >
        <div className="grid grid-cols-3 items-center h-14 px-2">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer transition-colors ${
              activeTab === 'home' ? 'text-[#141518]' : 'text-[#5A5D65]'
            }`}
          >
            <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-[#10B981]' : ''}`} />
            <span className="text-[10px] font-semibold tracking-tight mt-0.5 whitespace-nowrap">
              Overview
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('splitup')}
            className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer transition-colors ${
              activeTab === 'splitup' ? 'text-[#141518]' : 'text-[#5A5D65]'
            }`}
          >
            <PieChart className={`w-4 h-4 ${activeTab === 'splitup' ? 'text-[#10B981]' : ''}`} />
            <span className="text-[10px] font-semibold tracking-tight mt-0.5 whitespace-nowrap">
              Splitup
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer transition-colors ${
              activeTab === 'ledger' ? 'text-[#141518]' : 'text-[#5A5D65]'
            }`}
          >
            <ReceiptText className={`w-4 h-4 ${activeTab === 'ledger' ? 'text-[#10B981]' : ''}`} />
            <span className="text-[10px] font-semibold tracking-tight mt-0.5 whitespace-nowrap">
              Ledger
            </span>
          </button>
        </div>
      </nav>

      {/* Add Income / Expense Modal Sheet */}
      <EntrySheetModal
        isOpen={isModalOpen}
        initialType={modalInitialType}
        preselectedSourceId={modalPreselectedSourceId}
        incomeSources={incomeSources}
        expenseCategories={DEFAULT_EXPENSE_CATEGORIES}
        onClose={() => setIsModalOpen(false)}
        onSaveEntry={handleSaveEntry}
      />
    </div>
  );
}
