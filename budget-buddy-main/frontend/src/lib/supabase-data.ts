import { supabase } from "@/lib/supabase-client";
import type { Budget, Expense, Income, SavingsGoal } from "@/lib/finance-types";

type ExpenseRow = {
  id: string;
  amount: number;
  category: string;
  date: string;
  tags: string[] | null;
  payment_method: string;
  notes: string | null;
};

type IncomeRow = {
  id: string;
  source: string;
  amount: number;
  date: string;
  recurring: boolean;
};

type BudgetRow = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
};

type SavingsGoalRow = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon: string;
};

type LocalData = {
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
};

const LOCAL_STORAGE_KEY = "budget_buddy_local_data_v1";
let useLocalDataForSession = false;

function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function shouldUseLocalData(): boolean {
  return !supabase || useLocalDataForSession || isBrowserOffline();
}

function isNetworkError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message)
        : String(error);

  return /failed to fetch|networkerror|load failed|internet_disconnected|err_internet_disconnected/i.test(message);
}

function switchToLocalDataIfNetworkError(error: unknown): boolean {
  if (!isNetworkError(error)) return false;
  useLocalDataForSession = true;
  return true;
}

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    date: row.date,
    tags: row.tags ?? [],
    paymentMethod: row.payment_method,
    notes: row.notes ?? "",
  };
}

function mapIncome(row: IncomeRow): Income {
  return {
    id: row.id,
    source: row.source,
    amount: Number(row.amount),
    date: row.date,
    recurring: row.recurring,
  };
}

function mapBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    category: row.category,
    limit: Number(row.limit),
    spent: Number(row.spent),
    month: row.month,
  };
}

function mapSavingsGoal(row: SavingsGoalRow): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    deadline: row.deadline,
    icon: row.icon,
  };
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildDefaultLocalData(): LocalData {
  const now = new Date();
  const thisMonth = currentMonthKey();

  const incomes: Income[] = [
    { id: createId("inc"), source: "Salary", amount: 5000, date: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)), recurring: true },
    { id: createId("inc"), source: "Freelance", amount: 750, date: formatDate(new Date(now.getFullYear(), now.getMonth(), 10)), recurring: false },
  ];

  const expenses: Expense[] = [
    { id: createId("exp"), amount: 240, category: "Food & Dining", date: formatDate(new Date(now.getFullYear(), now.getMonth(), 5)), tags: ["groceries"], paymentMethod: "UPI", notes: "Weekly groceries" },
    { id: createId("exp"), amount: 120, category: "Transportation", date: formatDate(new Date(now.getFullYear(), now.getMonth(), 7)), tags: ["fuel"], paymentMethod: "Credit Card", notes: "Fuel refill" },
    { id: createId("exp"), amount: 90, category: "Entertainment", date: formatDate(new Date(now.getFullYear(), now.getMonth(), 12)), tags: ["movies"], paymentMethod: "Debit Card", notes: "Movie night" },
    { id: createId("exp"), amount: 300, category: "Utilities", date: formatDate(new Date(now.getFullYear(), now.getMonth(), 14)), tags: ["electricity"], paymentMethod: "Bank Transfer", notes: "Electricity bill" },
  ];

  const budgets: Budget[] = [
    { id: "bud-food", category: "Food & Dining", limit: 800, spent: 0, month: thisMonth },
    { id: "bud-transport", category: "Transportation", limit: 300, spent: 0, month: thisMonth },
    { id: "bud-entertainment", category: "Entertainment", limit: 250, spent: 0, month: thisMonth },
    { id: "bud-utilities", category: "Utilities", limit: 400, spent: 0, month: thisMonth },
  ];

  const savingsGoals: SavingsGoal[] = [
    { id: "goal-emergency", name: "Emergency Fund", targetAmount: 5000, currentAmount: 1800, deadline: `${now.getFullYear()}-12-31`, icon: "🛡️" },
    { id: "goal-vacation", name: "Vacation", targetAmount: 2000, currentAmount: 700, deadline: `${now.getFullYear()}-10-01`, icon: "✈️" },
    { id: "goal-laptop", name: "New Laptop", targetAmount: 1500, currentAmount: 500, deadline: `${now.getFullYear()}-09-01`, icon: "💻" },
  ];

  return { expenses, incomes, budgets, savingsGoals };
}

function ensureLocalData(): LocalData {
  if (typeof window === "undefined") return buildDefaultLocalData();

  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    const seed = buildDefaultLocalData();
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LocalData>;
    return {
      expenses: parsed.expenses ?? [],
      incomes: parsed.incomes ?? [],
      budgets: parsed.budgets ?? [],
      savingsGoals: parsed.savingsGoals ?? [],
    };
  } catch {
    const seed = buildDefaultLocalData();
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function saveLocalData(data: LocalData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

function computeBudgetSpent(budget: Budget, expenses: Expense[]): number {
  return expenses
    .filter((e) => e.category === budget.category && e.date.startsWith(budget.month))
    .reduce((sum, e) => sum + e.amount, 0);
}

export async function getExpenses(): Promise<Expense[]> {
  if (shouldUseLocalData()) {
    return ensureLocalData().expenses.slice().sort((a, b) => b.date.localeCompare(a.date));
  }

  const { data, error } = await supabase
    .from("expenses")
    .select("id, amount, category, date, tags, payment_method, notes")
    .order("date", { ascending: false });

  if (error) {
    if (switchToLocalDataIfNetworkError(error)) {
      return ensureLocalData().expenses.slice().sort((a, b) => b.date.localeCompare(a.date));
    }
    throw error;
  }
  return (data as ExpenseRow[]).map(mapExpense);
}

export async function addExpense(input: Omit<Expense, "id">): Promise<Expense> {
  if (shouldUseLocalData()) {
    const store = ensureLocalData();
    const created: Expense = { ...input, id: createId("exp") };
    store.expenses = [created, ...store.expenses];
    saveLocalData(store);
    return created;
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      amount: input.amount,
      category: input.category,
      date: input.date,
      tags: input.tags,
      payment_method: input.paymentMethod,
      notes: input.notes,
    })
    .select("id, amount, category, date, tags, payment_method, notes")
    .single();

  if (error) {
    if (switchToLocalDataIfNetworkError(error)) {
      const store = ensureLocalData();
      const created: Expense = { ...input, id: createId("exp") };
      store.expenses = [created, ...store.expenses];
      saveLocalData(store);
      return created;
    }
    throw error;
  }
  return mapExpense(data as ExpenseRow);
}

export async function deleteExpense(id: string): Promise<void> {
  if (shouldUseLocalData()) {
    const store = ensureLocalData();
    store.expenses = store.expenses.filter((e) => e.id !== id);
    saveLocalData(store);
    return;
  }

  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) {
    if (switchToLocalDataIfNetworkError(error)) {
      const store = ensureLocalData();
      store.expenses = store.expenses.filter((e) => e.id !== id);
      saveLocalData(store);
      return;
    }
    throw error;
  }
}

export async function getIncomes(): Promise<Income[]> {
  if (shouldUseLocalData()) {
    return ensureLocalData().incomes.slice().sort((a, b) => b.date.localeCompare(a.date));
  }

  const { data, error } = await supabase
    .from("incomes")
    .select("id, source, amount, date, recurring")
    .order("date", { ascending: false });

  if (error) {
    if (switchToLocalDataIfNetworkError(error)) {
      return ensureLocalData().incomes.slice().sort((a, b) => b.date.localeCompare(a.date));
    }
    throw error;
  }
  return (data as IncomeRow[]).map(mapIncome);
}

export async function addIncome(input: Omit<Income, "id">): Promise<Income> {
  if (shouldUseLocalData()) {
    const store = ensureLocalData();
    const created: Income = { ...input, id: createId("inc") };
    store.incomes = [created, ...store.incomes];
    saveLocalData(store);
    return created;
  }

  const { data, error } = await supabase
    .from("incomes")
    .insert({
      source: input.source,
      amount: input.amount,
      date: input.date,
      recurring: input.recurring,
    })
    .select("id, source, amount, date, recurring")
    .single();

  if (error) {
    if (switchToLocalDataIfNetworkError(error)) {
      const store = ensureLocalData();
      const created: Income = { ...input, id: createId("inc") };
      store.incomes = [created, ...store.incomes];
      saveLocalData(store);
      return created;
    }
    throw error;
  }
  return mapIncome(data as IncomeRow);
}

export async function getBudgets(): Promise<Budget[]> {
  if (shouldUseLocalData()) {
    const store = ensureLocalData();
    const month = currentMonthKey();
    const budgets = store.budgets
      .filter((b) => b.month === month)
      .map((b) => ({
        ...b,
        spent: Math.round(computeBudgetSpent(b, store.expenses) * 100) / 100,
      }))
      .sort((a, b) => a.category.localeCompare(b.category));

    return budgets;
  }

  const { data, error } = await supabase
    .from("budgets")
    .select("id, category, limit, spent, month")
    .order("category", { ascending: true });

  if (error) {
    if (switchToLocalDataIfNetworkError(error)) {
      const store = ensureLocalData();
      const month = currentMonthKey();
      return store.budgets
        .filter((b) => b.month === month)
        .map((b) => ({
          ...b,
          spent: Math.round(computeBudgetSpent(b, store.expenses) * 100) / 100,
        }))
        .sort((a, b) => a.category.localeCompare(b.category));
    }
    throw error;
  }
  return (data as BudgetRow[]).map(mapBudget);
}

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  if (shouldUseLocalData()) {
    return ensureLocalData().savingsGoals.slice().sort((a, b) => a.deadline.localeCompare(b.deadline));
  }

  const { data, error } = await supabase
    .from("savings_goals")
    .select("id, name, target_amount, current_amount, deadline, icon")
    .order("deadline", { ascending: true });

  if (error) {
    if (switchToLocalDataIfNetworkError(error)) {
      return ensureLocalData().savingsGoals.slice().sort((a, b) => a.deadline.localeCompare(b.deadline));
    }
    throw error;
  }
  return (data as SavingsGoalRow[]).map(mapSavingsGoal);
}
