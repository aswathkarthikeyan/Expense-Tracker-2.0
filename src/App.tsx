/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  PieChart,
  ReceiptText,
  Smartphone,
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
  filterEntriesByMonth,
  formatCurrency,
  getMascotState,
  type IncomeSourceConfig,
  type LedgerEntry,
  type TransactionType,
} from './utils/finance';
import { KokoMascot } from './components/KokoMascot';
import { EntrySheetModal } from './components/EntrySheetModal';
import { IncomeSplitupView } from './components/IncomeSplitupView';
import { LedgerView } from './components/LedgerView';
import { IOS27SettingsView } from './components/IOS27SettingsView';

type ActiveTab = 'home' | 'splitup' | 'ledger' | 'ios27';

const STORAGE_KEYS = {
  ENTRIES: 'koko_ios27_entries_v1',
  SOURCES: 'koko_ios27_sources_v1',
  CURRENCY: 'koko_ios27_currency_v1',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  const [entries, setEntries] = useState<LedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to seed
    }
    return INITIAL_SEED_ENTRIES;
  });

  const [incomeSources, setIncomeSources] = useState<IncomeSourceConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOURCES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to default sources
    }
    return DEFAULT_INCOME_SOURCES;
  });

  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENCY) || '$';
    } catch {
      return '$';
    }
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<TransactionType>('income');
  const [modalPreselectedSourceId, setModalPreselectedSourceId] = useState<string | undefined>(
    undefined
  );
  const [justAddedType, setJustAddedType] = useState<TransactionType | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    } catch {
      // Ignore storage quota errors
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(incomeSources));
    } catch {
      // Ignore storage quota errors
    }
  }, [incomeSources]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currencySymbol);
    } catch {
      // Ignore storage quota errors
    }
  }, [currencySymbol]);

  const filteredEntries = useMemo(
    () => filterEntriesByMonth(entries, monthFilter),
    [entries, monthFilter]
  );

  const summary = useMemo(
    () =>
      computeFinancialSummary(
        filteredEntries,
        incomeSources,
        DEFAULT_EXPENSE_CATEGORIES
      ),
    [filteredEntries, incomeSources]
  );

  const incomeSplit = useMemo(
    () => computeIncomeSplitup(filteredEntries, incomeSources),
    [filteredEntries, incomeSources]
  );

  const expenseSplit = useMemo(
    () => computeExpenseSplitup(filteredEntries, DEFAULT_EXPENSE_CATEGORIES),
    [filteredEntries]
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

  const handleAddCustomSource = (newSource: IncomeSourceConfig) => {
    setIncomeSources((prev) => [...prev, newSource]);
  };

  const recentEntries = useMemo(
    () => [...filteredEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [filteredEntries]
  );

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#141518] pb-24 lg:pb-12">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#F6F5F0]/90 backdrop-blur-md border-b border-black/8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-14">
          {/* Zone 1: Single text element Brand wordmark */}
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

          {/* Zone 2: Concise single-line navigation links */}
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
              Income Splitup
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
            <button
              type="button"
              onClick={() => setActiveTab('ios27')}
              className={`hover:text-[#141518] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'ios27'
                  ? 'text-[#141518] font-semibold underline decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              iOS 27 PWA
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleOpenAddModal('income')}
              className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-[#141518] rounded-xl hover:bg-[#272930] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              + Add Salary
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Workspace Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        {/* Period Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 text-xs text-[#5A5D65]">
            <span>iOS 27 Personal Cashflow</span>
            <span aria-hidden="true">·</span>
            <span>{summary.activeSourcesCount} Active Income Streams</span>
          </div>

          <div
            role="group"
            aria-label="Filter period"
            className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded-xl"
          >
            {[
              { id: 'all', label: 'All Time' },
              { id: '2026-10', label: 'Oct 2026' },
              { id: '2026-09', label: 'Sep 2026' },
            ].map((period) => (
              <button
                key={period.id}
                type="button"
                onClick={() => setMonthFilter(period.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  monthFilter === period.id
                    ? 'bg-white text-[#141518] shadow-xs'
                    : 'text-[#5A5D65] hover:text-[#141518]'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Switcher */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Left/Center Column (8 cols on Desktop, full width on iPhone) */}
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
                      {formatCurrency(summary.balanceLeft, currencySymbol)}
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
                    <span>Remaining Cushion</span>
                    <span>
                      {summary.incomeCount} salary {summary.incomeCount === 1 ? 'inflow' : 'inflows'} ·{' '}
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
                      {formatCurrency(summary.totalEarned, currencySymbol)}
                    </p>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      From {summary.activeSourcesCount} income{' '}
                      {summary.activeSourcesCount === 1 ? 'source' : 'sources'}
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
                      {formatCurrency(summary.totalSpent, currencySymbol)}
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
                    <span>Add Salary</span>
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

              {/* Reactive New-Age Mascot Card ("Koko") */}
              <KokoMascot
                mood={mascotState.mood}
                headline={mascotState.headline}
                subline={mascotState.subline}
                badgeText={mascotState.badgeText}
                summary={summary}
                currencySymbol={currencySymbol}
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
                      Latest salaries and expenses in this cycle
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ledger')}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#141518] hover:bg-[#F6F5F0] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>See All ({filteredEntries.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {recentEntries.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-sm font-semibold text-[#141518]">No transactions in this period</p>
                    <p className="text-xs text-[#5A5D65]">
                      Tap &ldquo;Add Salary&rdquo; or &ldquo;Add Expense&rdquo; above to log your first entry.
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
                              <div className="flex items-center gap-1.5 text-[11px] text-[#5A5D65] mt-0.5">
                                <span>{src?.name || 'Income Stream'}</span>
                                {cat && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span>{cat.name}</span>
                                  </>
                                )}
                                <span aria-hidden="true">·</span>
                                <span className="font-mono-num">{entry.date}</span>
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
                              {formatCurrency(entry.amount, currencySymbol)}
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

            {/* Secondary Right Column on Desktop / Quick Splitup Preview Card */}
            <aside className="lg:col-span-5 space-y-5">
              <div className="rounded-3xl bg-white border border-black/10 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#5A5D65]">
                      <span>Multi-Income Streams</span>
                      <span aria-hidden="true">·</span>
                      <span>{summary.activeSourcesCount} Active</span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-[#141518] mt-0.5">
                      Income Sources Splitup
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('splitup')}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#F6F5F0] hover:bg-[#EFECE6] text-xs font-semibold text-[#141518] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>Full Splitup</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Stacked Bar Preview */}
                <div className="h-3 w-full rounded-full bg-[#EFECE6] overflow-hidden flex gap-0.5 p-0.5">
                  {incomeSplit
                    .filter((s) => s.totalAmount > 0)
                    .map((item) => (
                      <div
                        key={item.sourceId}
                        style={{
                          width: `${Math.max(item.percentageOfIncome, 4)}%`,
                          backgroundColor: item.color,
                        }}
                        className="h-full first:rounded-l-full last:rounded-r-full"
                      />
                    ))}
                </div>

                <div className="space-y-2.5">
                  {incomeSplit
                    .filter((s) => s.totalAmount > 0)
                    .map((src) => (
                      <div
                        key={src.sourceId}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F5F0] border border-black/5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ backgroundColor: src.color }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#141518] truncate">{src.name}</p>
                            <p className="text-[11px] text-[#5A5D65]">
                              {src.tag} · {src.entryCount} {src.entryCount === 1 ? 'payout' : 'payouts'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-2">
                          <p className="font-mono-num text-xs font-bold text-[#141518]">
                            {formatCurrency(src.totalAmount, currencySymbol)}
                          </p>
                          <p className="font-mono-num text-[11px] font-semibold text-[#047857]">
                            {src.percentageOfIncome}%
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('splitup')}
                  className="w-full min-h-[44px] rounded-2xl border border-black/15 text-xs font-semibold text-[#141518] hover:bg-[#F6F5F0] transition-colors cursor-pointer"
                >
                  Open Detailed Income & Expense Splitup
                </button>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'splitup' && (
          <IncomeSplitupView
            summary={summary}
            incomeSplit={incomeSplit}
            expenseSplit={expenseSplit}
            incomeSources={incomeSources}
            currencySymbol={currencySymbol}
            onQuickLogToSource={(sourceId) => handleOpenAddModal('income', sourceId)}
            onAddCustomSource={handleAddCustomSource}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerView
            entries={filteredEntries}
            incomeSources={incomeSources}
            expenseCategories={DEFAULT_EXPENSE_CATEGORIES}
            currencySymbol={currencySymbol}
            onDeleteEntry={handleDeleteEntry}
            onOpenAddModal={(type) => handleOpenAddModal(type)}
          />
        )}

        {activeTab === 'ios27' && (
          <IOS27SettingsView
            currencySymbol={currencySymbol}
            onChangeCurrency={setCurrencySymbol}
            entries={entries}
            incomeSources={incomeSources}
            onResetDemoData={() => {
              setEntries(INITIAL_SEED_ENTRIES);
              setIncomeSources(DEFAULT_INCOME_SOURCES);
            }}
            onClearAllData={() => setEntries([])}
          />
        )}
      </main>

      {/* Fixed Bottom Thumb-Zone Tab Bar for iPhone / Mobile Viewports */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 backdrop-blur-md border-t border-black/10"
      >
        <div className="grid grid-cols-4 items-center h-14 px-2">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer transition-colors ${
              activeTab === 'home' ? 'text-[#141518]' : 'text-[#5A5D65]'
            }`}
          >
            <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-[#10B981]' : ''}`} />
            <span className="text-[10px] font-semibold tracking-tight mt-0.5 whitespace-nowrap">
              Home
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

          <button
            type="button"
            onClick={() => setActiveTab('ios27')}
            className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer transition-colors ${
              activeTab === 'ios27' ? 'text-[#141518]' : 'text-[#5A5D65]'
            }`}
          >
            <Smartphone className={`w-4 h-4 ${activeTab === 'ios27' ? 'text-[#10B981]' : ''}`} />
            <span className="text-[10px] font-semibold tracking-tight mt-0.5 whitespace-nowrap">
              iOS 27 PWA
            </span>
          </button>
        </div>
      </nav>

      {/* Add Salary / Expense Modal Sheet */}
      <EntrySheetModal
        isOpen={isModalOpen}
        initialType={modalInitialType}
        preselectedSourceId={modalPreselectedSourceId}
        incomeSources={incomeSources}
        expenseCategories={DEFAULT_EXPENSE_CATEGORIES}
        currencySymbol={currencySymbol}
        onClose={() => setIsModalOpen(false)}
        onSaveEntry={handleSaveEntry}
        onAddCustomSource={handleAddCustomSource}
      />
    </div>
  );
}
