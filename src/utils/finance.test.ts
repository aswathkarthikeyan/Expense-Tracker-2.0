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
  formatINR,
  getMascotState,
  validateLedgerInput,
  type LedgerEntry,
} from './finance.ts';

const SAMPLE_TEST_ENTRIES: LedgerEntry[] = [
  {
    id: 't-1',
    type: 'income',
    title: 'Monthly Stipend',
    amount: 45000,
    date: '2026-10-01',
    sourceId: 'src-stipend',
  },
  {
    id: 't-2',
    type: 'income',
    title: 'Product Consulting Project',
    amount: 30000,
    date: '2026-10-05',
    sourceId: 'src-consulting',
  },
  {
    id: 't-3',
    type: 'expense',
    title: 'Apartment Rent',
    amount: 18000,
    date: '2026-10-06',
    sourceId: 'src-stipend',
    categoryId: 'cat-housing',
  },
  {
    id: 't-4',
    type: 'expense',
    title: 'Groceries & Dining',
    amount: 7000,
    date: '2026-10-10',
    sourceId: 'src-consulting',
    categoryId: 'cat-food',
  },
];

test('initial seed data is empty and only Stipend and Consulting exist as income sources', () => {
  assert.equal(INITIAL_SEED_ENTRIES.length, 0);
  assert.equal(DEFAULT_INCOME_SOURCES.length, 2);
  assert.equal(DEFAULT_INCOME_SOURCES[0].name, 'Stipend');
  assert.equal(DEFAULT_INCOME_SOURCES[1].name, 'Consulting');
});

test('computeFinancialSummary accurately calculates Total Earned and Balance Left in INR', () => {
  const summary = computeFinancialSummary(
    SAMPLE_TEST_ENTRIES,
    DEFAULT_INCOME_SOURCES,
    DEFAULT_EXPENSE_CATEGORIES
  );

  // Incomes: 45000 + 30000 = 75000
  assert.equal(summary.totalEarned, 75000);
  // Expenses: 18000 + 7000 = 25000
  assert.equal(summary.totalSpent, 25000);
  // Balance Left: 75000 - 25000 = 50000
  assert.equal(summary.balanceLeft, 50000);
  assert.equal(summary.activeSourcesCount, 2);
  assert.equal(summary.topIncomeSource?.sourceId, 'src-stipend');
});

test('computeIncomeSplitup calculates Stipend and Consulting totals, expenses funded, and percentage shares', () => {
  const split = computeIncomeSplitup(SAMPLE_TEST_ENTRIES, DEFAULT_INCOME_SOURCES);

  const stipendSplit = split.find((s) => s.sourceId === 'src-stipend');
  assert.ok(stipendSplit);
  assert.equal(stipendSplit.totalAmount, 45000);
  assert.equal(stipendSplit.expensesFunded, 18000);
  assert.equal(stipendSplit.netBalance, 27000);
  assert.equal(stipendSplit.percentageOfIncome, 60);

  const consultingSplit = split.find((s) => s.sourceId === 'src-consulting');
  assert.ok(consultingSplit);
  assert.equal(consultingSplit.totalAmount, 30000);
  assert.equal(consultingSplit.expensesFunded, 7000);
  assert.equal(consultingSplit.netBalance, 23000);
  assert.equal(consultingSplit.percentageOfIncome, 40);
});

test('computeExpenseSplitup sorts expense categories by highest spend', () => {
  const expSplit = computeExpenseSplitup(SAMPLE_TEST_ENTRIES, DEFAULT_EXPENSE_CATEGORIES);
  assert.equal(expSplit[0].categoryId, 'cat-housing');
  assert.equal(expSplit[0].totalAmount, 18000);
  assert.equal(expSplit[1].categoryId, 'cat-food');
  assert.equal(expSplit[1].totalAmount, 7000);
});

test('getMascotState handles empty zero-state, thriving, and overdrawn states', () => {
  const emptySummary = computeFinancialSummary(
    [],
    DEFAULT_INCOME_SOURCES,
    DEFAULT_EXPENSE_CATEGORIES
  );
  assert.equal(getMascotState(emptySummary).mood, 'steady');

  const thrivingSummary = computeFinancialSummary(
    SAMPLE_TEST_ENTRIES,
    DEFAULT_INCOME_SOURCES,
    DEFAULT_EXPENSE_CATEGORIES
  );
  assert.equal(getMascotState(thrivingSummary).mood, 'thriving');
  assert.equal(getMascotState(thrivingSummary, 'income').mood, 'celebrating');
});

test('validateLedgerInput and formatINR work as expected', () => {
  assert.equal(
    validateLedgerInput({ title: '', amountStr: '1000', sourceId: 'src-stipend', date: '2026-10-20' }).valid,
    false
  );
  const validRes = validateLedgerInput({
    title: 'October Stipend',
    amountStr: '45000',
    sourceId: 'src-stipend',
    date: '2026-10-20',
  });
  assert.equal(validRes.valid, true);
  assert.equal(validRes.parsedAmount, 45000);

  const oct = filterEntriesByMonth(SAMPLE_TEST_ENTRIES, '2026-10');
  assert.equal(oct.length, 4);
  assert.equal(formatINR(145000), '₹1,45,000');
});
