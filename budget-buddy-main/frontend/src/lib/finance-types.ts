export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  tags: string[];
  paymentMethod: string;
  notes: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string;
  recurring: boolean;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
] as const;

export const PAYMENT_METHODS = ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "UPI"] as const;

export const categoryColors: Record<string, string> = {
  "Food & Dining": "hsl(var(--chart-food))",
  Transportation: "hsl(var(--chart-transport))",
  Entertainment: "hsl(var(--chart-entertainment))",
  Shopping: "hsl(var(--chart-shopping))",
  Utilities: "hsl(var(--chart-utilities))",
  Healthcare: "hsl(var(--chart-income))",
  Education: "hsl(var(--chart-savings))",
  Travel: "hsl(var(--chart-transport))",
  Other: "hsl(var(--muted-foreground))",
};
