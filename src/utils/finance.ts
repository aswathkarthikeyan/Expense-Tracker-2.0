export type TransactionType = 'income' | 'expense';

export interface IncomeSourceConfig {
  id: string;
  name: string;
  color: string;
  tag: string; // e.g. 'Salary', 'Freelance', 'Passive', 'Business', 'Bonus'
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
  /** For 'income', this is the income source ID. For 'expense', optional funding source ID */
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

export const DEFAULT_INCOME_SOURCES: IncomeSourceConfig[] = [
  { id: 'src-salary', name: 'Primary Tech Salary', color: '#10B981', tag: 'Base Salary' },
  { id: 'src-freelance', name: 'Design & Dev Retainer', color: '#3B82F6', tag: 'Freelance' },
  { id: 'src-saas', name: 'Micro-SaaS Templates', color: '#8B5CF6', tag: 'Side Business' },
  { id: 'src-dividends', name: 'ETF & High-Yield Vault', color: '#F59E0B', tag: 'Passive Yield' },
  { id: 'src-bonus', name: 'Performance & Spot Bonus', color: '#EC4899', tag: 'Bonus' },
];

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategoryConfig[] = [
  { id: 'cat-housing', name: 'Housing & Studio', color: '#F43F5E' },
  { id: 'cat-food', name: 'Dining & Groceries', color: '#FB923C' },
  { id: 'cat-software', name: 'Cloud & Subscriptions', color: '#6366F1' },
  { id: 'cat-transport', name: 'Transit & Mobility', color: '#14B8A6' },
  { id: 'cat-lifestyle', name: 'Gear & Lifestyle', color: '#A855F7' },
  { id: 'cat-utilities', name: 'Bills & Utilities', color: '#64748B' },
];

export const INITIAL_SEED_ENTRIES: LedgerEntry[] = [
  {
    id: 'ent-1',
    type: 'income',
    title: 'October Base Salary Payout',
    amount: 5400,
    date: '2026-10-01',
    sourceId: 'src-salary',
    note: 'Direct deposit after tax',
  },
  {
    id: 'ent-2',
    type: 'income',
    title: 'iOS UI Kit Client Retainer',
    amount: 1850,
    date: '2026-10-06',
    sourceId: 'src-freelance',
    note: 'Monthly product design advisory',
  },
  {
    id: 'ent-3',
    type: 'income',
    title: 'Figma & Framer Component Sales',
    amount: 920,
    date: '2026-10-11',
    sourceId: 'src-saas',
    note: 'Gumroad + LemonSqueezy payout',
  },
  {
    id: 'ent-4',
    type: 'income',
    title: 'Quarterly Treasury & ETF Yield',
    amount: 430,
    date: '2026-10-14',
    sourceId: 'src-dividends',
    note: 'Automated dividend distribution',
  },
  {
    id: 'ent-5',
    type: 'expense',
    title: 'Loft Apartment Rent',
    amount: 1950,
    date: '2026-10-02',
    sourceId: 'src-salary',
    categoryId: 'cat-housing',
    note: 'Monthly lease payment',
  },
  {
    id: 'ent-6',
    type: 'expense',
    title: 'Organic Market & Matcha Bar',
    amount: 420,
    date: '2026-10-08',
    sourceId: 'src-salary',
    categoryId: 'cat-food',
    note: 'Weekly groceries and coffee runs',
  },
  {
    id: 'ent-7',
    type: 'expense',
    title: 'Vercel, Figma & AI Compute',
    amount: 165,
    date: '2026-10-12',
    sourceId: 'src-freelance',
    categoryId: 'cat-software',
    note: 'Creator stack subscriptions',
  },
  {
    id: 'ent-8',
    type: 'expense',
    title: 'Metro Pass & Airport Ride',
    amount: 140,
    date: '2026-10-16',
    sourceId: 'src-saas',
    categoryId: 'cat-transport',
    note: 'City transit card reload',
  },
  {
    id: 'ent-9',
    type: 'expense',
    title: 'Fiber Internet & Electricity',
    amount: 175,
    date: '2026-10-18',
    sourceId: 'src-salary',
    categoryId: 'cat-utilities',
    note: 'Home studio utilities',
  },
];

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
  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);

  const sourceMap = new Map<string, SourceSplitItem>();

  for (const src of sources) {
    sourceMap.set(src.id, {
      sourceId: src.id,
      name: src.name,
      tag: src.tag,
      color: src.color,
      totalAmount: 0,
      percentageOfIncome: 0,
      entryCount: 0,
      averageEntry: 0,
      entries: [],
    });
  }

  for (const entry of incomeEntries) {
    let bucket = sourceMap.get(entry.sourceId);
    if (!bucket) {
      bucket = {
        sourceId: entry.sourceId,
        name: 'Other Income Source',
        tag: 'Custom',
        color: '#10B981',
        totalAmount: 0,
        percentageOfIncome: 0,
        entryCount: 0,
        averageEntry: 0,
        entries: [],
      };
      sourceMap.set(entry.sourceId, bucket);
    }
    bucket.totalAmount += entry.amount;
    bucket.entryCount += 1;
    bucket.entries.push(entry);
  }

  const result: SourceSplitItem[] = [];
  for (const item of sourceMap.values()) {
    const pct = totalIncome > 0 ? (item.totalAmount / totalIncome) * 100 : 0;
    const avg = item.entryCount > 0 ? item.totalAmount / item.entryCount : 0;
    result.push({
      ...item,
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
  const expenseEntries = entries.filter((e) => e.type === 'expense');
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0);

  const catMap = new Map<string, CategorySplitItem>();
  for (const cat of categories) {
    catMap.set(cat.id, {
      categoryId: cat.id,
      name: cat.name,
      color: cat.color,
      totalAmount: 0,
      percentageOfExpenses: 0,
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
        entryCount: 0,
      };
      catMap.set(key, bucket);
    }
    bucket.totalAmount += entry.amount;
    bucket.entryCount += 1;
  }

  const result: CategorySplitItem[] = [];
  for (const item of catMap.values()) {
    const pct = totalExpenses > 0 ? (item.totalAmount / totalExpenses) * 100 : 0;
    result.push({
      ...item,
      percentageOfExpenses: Number(pct.toFixed(1)),
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
      headline: 'Fresh inflow locked in!',
      subline: `Koko just stacked your new income stream. Balance left is now ${summary.retentionRatio}% of total earned.`,
      badgeText: 'Inflow Boost',
    };
  }

  if (summary.totalEarned === 0 && summary.totalSpent === 0) {
    return {
      mood: 'steady',
      headline: 'Koko is ready for your first paycheck.',
      subline: 'Tap "+ Add Salary" below to log your primary salary or side income streams.',
      badgeText: 'Ready',
    };
  }

  if (summary.balanceLeft < 0 || (summary.totalEarned === 0 && summary.totalSpent > 0)) {
    return {
      mood: 'overdrawn',
      headline: 'Expenses outpaced total earned!',
      subline: 'Your balance dipped below zero. Check the Splitup tab to review top spending or log new income.',
      badgeText: 'Over Budget',
    };
  }

  if (summary.retentionRatio >= 55) {
    const topSrc = summary.topIncomeSource ? summary.topIncomeSource.name : 'your streams';
    return {
      mood: 'thriving',
      headline: `Keeping ${summary.retentionRatio}% of what you earn!`,
      subline: `${summary.activeSourcesCount} active income ${
        summary.activeSourcesCount === 1 ? 'source' : 'sources'
      } led by ${topSrc}. Cushion looks super healthy.`,
      badgeText: 'Thriving Cushion',
    };
  }

  if (summary.retentionRatio >= 25) {
    return {
      mood: 'steady',
      headline: `Balanced runway — ${summary.retentionRatio}% left.`,
      subline: `You've spent ${summary.spentRatio}% of total earned across ${summary.expenseCount} expenses. Pace is steady.`,
      badgeText: 'Steady Pace',
    };
  }

  return {
    mood: 'mindful',
    headline: `Tight buffer — ${summary.retentionRatio}% left.`,
    subline: 'Most of your earned income is spoken for. Keep discretionary expenses light this cycle.',
    badgeText: 'Mindful Mode',
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
    return { valid: false, error: 'Please enter an amount greater than 0.' };
  }

  if (numericAmount > 999999999) {
    return { valid: false, error: 'Amount exceeds maximum allowed limit.' };
  }

  if (!params.sourceId.trim()) {
    return { valid: false, error: 'Please choose an income source.' };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    return { valid: false, error: 'Please provide a valid date (YYYY-MM-DD).' };
  }

  return {
    valid: true,
    parsedAmount: Number(numericAmount.toFixed(2)),
  };
}

export function formatCurrency(amount: number, symbol = '$'): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = absVal.toLocaleString('en-US', {
    minimumFractionDigits: absVal % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}
