import test from 'node:test';
import assert from 'node:assert/strict';
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
  validateLedgerInput,
  type LedgerEntry,
} from './finance.ts';

test('computeFinancialSummary accurately calculates Total Earned and Balance Left after expenses', () => {
  const summary = computeFinancialSummary(
    INITIAL_SEED_ENTRIES,
    DEFAULT_INCOME_SOURCES,
    DEFAULT_EXPENSE_CATEGORIES
  );

  // Incomes: 5400 + 1850 + 920 + 430 = 8600
  assert.equal(summary.totalEarned, 8600);
  // Expenses: 1950 + 420 + 165 + 140 + 175 = 2850
  assert.equal(summary.totalSpent, 2850);
  // Balance Left: 8600 - 2850 = 5750
  assert.equal(summary.balanceLeft, 5750);
  assert.equal(summary.activeSourcesCount, 4);
  assert.equal(summary.topIncomeSource?.sourceId, 'src-salary');
  assert.equal(summary.topExpenseCategory?.categoryId, 'cat-housing');
});

test('computeIncomeSplitup calculates exact per-source totals and percentage shares', () => {
  const split = computeIncomeSplitup(INITIAL_SEED_ENTRIES, DEFAULT_INCOME_SOURCES);

  const salarySplit = split.find((s) => s.sourceId === 'src-salary');
  assert.ok(salarySplit);
  assert.equal(salarySplit.totalAmount, 5400);
  // 5400 / 8600 = 62.79% -> 62.8%
  assert.equal(salarySplit.percentageOfIncome, 62.8);

  const freelanceSplit = split.find((s) => s.sourceId === 'src-freelance');
  assert.ok(freelanceSplit);
  assert.equal(freelanceSplit.totalAmount, 1850);
  assert.equal(freelanceSplit.percentageOfIncome, 21.5);
});

test('computeExpenseSplitup sorts expense categories by highest spend', () => {
  const expSplit = computeExpenseSplitup(INITIAL_SEED_ENTRIES, DEFAULT_EXPENSE_CATEGORIES);
  assert.equal(expSplit[0].categoryId, 'cat-housing');
  assert.equal(expSplit[0].totalAmount, 1950);
  assert.equal(expSplit[1].categoryId, 'cat-food');
  assert.equal(expSplit[1].totalAmount, 420);
});

test('getMascotState transitions between thriving, mindful, overdrawn, and celebrating', () => {
  const thrivingSummary = computeFinancialSummary(
    INITIAL_SEED_ENTRIES,
    DEFAULT_INCOME_SOURCES,
    DEFAULT_EXPENSE_CATEGORIES
  );
  assert.equal(getMascotState(thrivingSummary).mood, 'thriving');
  assert.equal(getMascotState(thrivingSummary, 'income').mood, 'celebrating');

  const overdrawnEntries: LedgerEntry[] = [
    { id: '1', type: 'income', title: 'Side Gig', amount: 500, date: '2026-10-01', sourceId: 'src-freelance' },
    { id: '2', type: 'expense', title: 'Laptop Repair', amount: 750, date: '2026-10-02', sourceId: 'src-freelance', categoryId: 'cat-software' },
  ];
  const overdrawnSummary = computeFinancialSummary(
    overdrawnEntries,
    DEFAULT_INCOME_SOURCES,
    DEFAULT_EXPENSE_CATEGORIES
  );
  assert.equal(overdrawnSummary.balanceLeft, -250);
  assert.equal(getMascotState(overdrawnSummary).mood, 'overdrawn');
});

test('validateLedgerInput rejects empty title or non-positive amounts and accepts valid entries', () => {
  assert.equal(
    validateLedgerInput({ title: '', amountStr: '100', sourceId: 'src-salary', date: '2026-10-20' }).valid,
    false
  );
  assert.equal(
    validateLedgerInput({ title: 'Salary', amountStr: '-50', sourceId: 'src-salary', date: '2026-10-20' }).valid,
    false
  );
  const validRes = validateLedgerInput({
    title: 'Consulting Payout',
    amountStr: '1250.50',
    sourceId: 'src-freelance',
    date: '2026-10-20',
  });
  assert.equal(validRes.valid, true);
  assert.equal(validRes.parsedAmount, 1250.5);
});

test('filterEntriesByMonth filters YYYY-MM accurately and formatCurrency formats negative values', () => {
  const oct = filterEntriesByMonth(INITIAL_SEED_ENTRIES, '2026-10');
  assert.equal(oct.length, INITIAL_SEED_ENTRIES.length);
  const sep = filterEntriesByMonth(INITIAL_SEED_ENTRIES, '2026-09');
  assert.equal(sep.length, 0);

  assert.equal(formatCurrency(5750, '$'), '$5,750');
  assert.equal(formatCurrency(-250, '$'), '-$250');
});
