export type TransactionType = 'income' | 'expense';

export interface IncomeSourceConfig {
  id: string;
  name: string;
  color: string;
  tag: string;
}

export interface ExpenseCategoryConfig {
  id: string;
  name: string;
  color: string;
}

export interface LedgerEntry {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  /** For 'income', this is the income source ID ('src-stipend' | 'src-consulting'). For 'expense', funding source ID */
  sourceId: string;
  /** For 'expense', this is the expense category ID */
  categoryId?: string;
  note?: string;
}

export type MascotMood = 'thriving' | 'steady' | 'mindful' | 'overdrawn' | 'celebrating';

export interface SourceSplitItem {
  sourceId: string;
  name: string;
  tag: string;
  color: string;
  totalAmount: number;
  expensesFunded: number;
  netBalance: number;
  percentageOfIncome: number;
  entryCount: number;
  averageEntry: number;
  entries: LedgerEntry[];
}

export interface CategorySplitItem {
  categoryId: string;
  name: string;
  color: string;
  totalAmount: number;
  percentageOfExpenses: number;
  percentageOfIncome: number;
  entryCount: number;
}

export interface FinancialSummary {
  totalEarned: number;
  totalSpent: number;
  balanceLeft: number;
  retentionRatio: number; // 0 to 100 (% of income remaining)
  spentRatio: number; // 0 to 100 (% of income spent)
  incomeCount: number;
  expenseCount: number;
  activeSourcesCount: number;
  topIncomeSource: SourceSplitItem | null;
  topExpenseCategory: CategorySplitItem | null;
}

export const CURRENCY_SYMBOL = '₹';

export const DEFAULT_INCOME_SOURCES: IncomeSourceConfig[] = [
  { id: 'src-stipend', name: 'Stipend', color: '#10B981', tag: 'Stipend' },
  { id: 'src-consulting', name: 'Consulting', color: '#3B82F6', tag: 'Consulting' },
];

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategoryConfig[] = [
  { id: 'cat-housing', name: 'Housing & Rent', color: '#F43F5E' },
  { id: 'cat-food', name: 'Groceries & Dining', color: '#FB923C' },
  { id: 'cat-software', name: 'Work & Subscriptions', color: '#6366F1' },
  { id: 'cat-transport', name: 'Transit & Travel', color: '#14B8A6' },
  { id: 'cat-lifestyle', name: 'Shopping & Personal', color: '#A855F7' },
  { id: 'cat-utilities', name: 'Bills & Utilities', color: '#64748B' },
];

export const INITIAL_SEED_ENTRIES: LedgerEntry[] = [];

export function filterEntriesByMonth(entries: LedgerEntry[], monthFilter: string): LedgerEntry[] {
  if (!monthFilter || monthFilter === 'all') {
    return entries;
  }
  return entries.filter((entry) => entry.date.startsWith(monthFilter));
}

export function computeIncomeSplitup(
  entries: LedgerEntry[],
  sources: IncomeSourceConfig[]
): SourceSplitItem[] {
  const incomeEntries = entries.filter((e) => e.type === 'income');
  const expenseEntries = entries.filter((e) => e.type === 'expense');
  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);

  const sourceMap = new Map<string, SourceSplitItem>();

  for (const src of sources) {
    sourceMap.set(src.id, {
      sourceId: src.id,
      name: src.name,
      tag: src.tag,
      color: src.color,
      totalAmount: 0,
      expensesFunded: 0,
      netBalance: 0,
      percentageOfIncome: 0,
      entryCount: 0,
      averageEntry: 0,
      entries: [],
    });
  }

  for (const entry of incomeEntries) {
    const bucket = sourceMap.get(entry.sourceId) || sourceMap.get('src-stipend');
    if (bucket) {
      bucket.totalAmount += entry.amount;
      bucket.entryCount += 1;
      bucket.entries.push(entry);
    }
  }

  for (const exp of expenseEntries) {
    const bucket = sourceMap.get(exp.sourceId);
    if (bucket) {
      bucket.expensesFunded += exp.amount;
    }
  }

  const result: SourceSplitItem[] = [];
  for (const item of sourceMap.values()) {
    const pct = totalIncome > 0 ? (item.totalAmount / totalIncome) * 100 : 0;
    const avg = item.entryCount > 0 ? item.totalAmount / item.entryCount : 0;
    result.push({
      ...item,
      netBalance: Number((item.totalAmount - item.expensesFunded).toFixed(2)),
      percentageOfIncome: Number(pct.toFixed(1)),
      averageEntry: Number(avg.toFixed(2)),
    });
  }

  return result.sort((a, b) => b.totalAmount - a.totalAmount);
}

export function computeExpenseSplitup(
  entries: LedgerEntry[],
  categories: ExpenseCategoryConfig[]
): CategorySplitItem[] {
  const incomeEntries = entries.filter((e) => e.type === 'income');
  const expenseEntries = entries.filter((e) => e.type === 'expense');
  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0);

  const catMap = new Map<string, CategorySplitItem>();
  for (const cat of categories) {
    catMap.set(cat.id, {
      categoryId: cat.id,
      name: cat.name,
      color: cat.color,
      totalAmount: 0,
      percentageOfExpenses: 0,
      percentageOfIncome: 0,
      entryCount: 0,
    });
  }

  for (const entry of expenseEntries) {
    const key = entry.categoryId || 'cat-utilities';
    let bucket = catMap.get(key);
    if (!bucket) {
      bucket = {
        categoryId: key,
        name: 'General Expense',
        color: '#64748B',
        totalAmount: 0,
        percentageOfExpenses: 0,
        percentageOfIncome: 0,
        entryCount: 0,
      };
      catMap.set(key, bucket);
    }
    bucket.totalAmount += entry.amount;
    bucket.entryCount += 1;
  }

  const result: CategorySplitItem[] = [];
  for (const item of catMap.values()) {
    const pctExp = totalExpenses > 0 ? (item.totalAmount / totalExpenses) * 100 : 0;
    const pctInc = totalIncome > 0 ? (item.totalAmount / totalIncome) * 100 : 0;
    result.push({
      ...item,
      percentageOfExpenses: Number(pctExp.toFixed(1)),
      percentageOfIncome: Number(pctInc.toFixed(1)),
    });
  }

  return result.sort((a, b) => b.totalAmount - a.totalAmount);
}

export function computeFinancialSummary(
  entries: LedgerEntry[],
  sources: IncomeSourceConfig[],
  categories: ExpenseCategoryConfig[]
): FinancialSummary {
  const incomeEntries = entries.filter((e) => e.type === 'income');
  const expenseEntries = entries.filter((e) => e.type === 'expense');

  const totalEarned = Number(incomeEntries.reduce((sum, e) => sum + e.amount, 0).toFixed(2));
  const totalSpent = Number(expenseEntries.reduce((sum, e) => sum + e.amount, 0).toFixed(2));
  const balanceLeft = Number((totalEarned - totalSpent).toFixed(2));

  const retentionRatio =
    totalEarned > 0 ? Math.max(0, Math.min(100, Number(((balanceLeft / totalEarned) * 100).toFixed(1)))) : 0;
  const spentRatio =
    totalEarned > 0 ? Math.max(0, Math.min(100, Number(((totalSpent / totalEarned) * 100).toFixed(1)))) : 0;

  const incomeSplit = computeIncomeSplitup(entries, sources);
  const activeSources = incomeSplit.filter((s) => s.totalAmount > 0);
  const expenseSplit = computeExpenseSplitup(entries, categories).filter((c) => c.totalAmount > 0);

  return {
    totalEarned,
    totalSpent,
    balanceLeft,
    retentionRatio,
    spentRatio,
    incomeCount: incomeEntries.length,
    expenseCount: expenseEntries.length,
    activeSourcesCount: activeSources.length,
    topIncomeSource: activeSources.length > 0 ? activeSources[0] : null,
    topExpenseCategory: expenseSplit.length > 0 ? expenseSplit[0] : null,
  };
}

export function getMascotState(
  summary: FinancialSummary,
  justAddedType?: TransactionType | null
): {
  mood: MascotMood;
  headline: string;
  subline: string;
  badgeText: string;
} {
  if (justAddedType === 'income') {
    return {
      mood: 'celebrating',
      headline: 'New income recorded!',
      subline: `Koko updated your balance. You have ${formatINR(summary.balanceLeft)} (${summary.retentionRatio}%) remaining.`,
      badgeText: 'Inflow Added',
    };
  }

  if (summary.totalEarned === 0 && summary.totalSpent === 0) {
    return {
      mood: 'steady',
      headline: 'Ready to track Stipend & Consulting.',
      subline: 'Tap "+ Add Income" above to log your Stipend or Consulting inflow, or "+ Add Expense" to record spending.',
      badgeText: 'Fresh Ledger',
    };
  }

  if (summary.balanceLeft < 0 || (summary.totalEarned === 0 && summary.totalSpent > 0)) {
    return {
      mood: 'overdrawn',
      headline: 'Expenses exceeded total earned!',
      subline: 'Your balance is below zero. Review the Splitup & Tables tab or log your latest Stipend / Consulting payout.',
      badgeText: 'Overdrawn',
    };
  }

  if (summary.retentionRatio >= 55) {
    const topSrc = summary.topIncomeSource ? summary.topIncomeSource.name : 'your sources';
    return {
      mood: 'thriving',
      headline: `Retaining ${summary.retentionRatio}% of total earned!`,
      subline: `Led by ${topSrc}. Your remaining balance is ${formatINR(summary.balanceLeft)}.`,
      badgeText: 'Healthy',
    };
  }

  if (summary.retentionRatio >= 25) {
    return {
      mood: 'steady',
      headline: `Balanced pace — ${summary.retentionRatio}% left.`,
      subline: `You have spent ${summary.spentRatio}% of total earned across ${summary.expenseCount} expenses.`,
      badgeText: 'Steady Pace',
    };
  }

  return {
    mood: 'mindful',
    headline: `Tight buffer — ${summary.retentionRatio}% left.`,
    subline: 'Most of your Stipend and Consulting income is spent for this period.',
    badgeText: 'Low Cushion',
  };
}

export interface EntryValidationResult {
  valid: boolean;
  error?: string;
  parsedAmount?: number;
}

export function validateLedgerInput(params: {
  title: string;
  amountStr: string;
  sourceId: string;
  date: string;
}): EntryValidationResult {
  const cleanTitle = params.title.trim();
  if (!cleanTitle) {
    return { valid: false, error: 'Please enter a short description or title.' };
  }

  const numericAmount = Number(params.amountStr);
  if (!params.amountStr.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) {
    return { valid: false, error: 'Please enter an amount in INR greater than 0.' };
  }

  if (numericAmount > 999999999) {
    return { valid: false, error: 'Amount exceeds maximum allowed limit.' };
  }

  if (!params.sourceId.trim()) {
    return { valid: false, error: 'Please choose Stipend or Consulting.' };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    return { valid: false, error: 'Please provide a valid date (YYYY-MM-DD).' };
  }

  return {
    valid: true,
    parsedAmount: Number(numericAmount.toFixed(2)),
  };
}

export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = absVal.toLocaleString('en-IN', {
    minimumFractionDigits: absVal % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatCurrency(amount: number): string {
  return formatINR(amount);
}
