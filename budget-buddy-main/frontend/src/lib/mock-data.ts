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

export const mockExpenses: Expense[] = [
  { id: "1", amount: 45.50, category: "Food & Dining", date: "2026-02-26", tags: ["lunch", "work"], paymentMethod: "Credit Card", notes: "Team lunch" },
  { id: "2", amount: 120.00, category: "Transportation", date: "2026-02-25", tags: ["gas"], paymentMethod: "Debit Card", notes: "Weekly fuel" },
  { id: "3", amount: 89.99, category: "Entertainment", date: "2026-02-24", tags: ["subscription"], paymentMethod: "Credit Card", notes: "Annual streaming" },
  { id: "4", amount: 250.00, category: "Shopping", date: "2026-02-23", tags: ["clothing"], paymentMethod: "Credit Card", notes: "Winter jacket" },
  { id: "5", amount: 75.00, category: "Utilities", date: "2026-02-22", tags: ["electricity"], paymentMethod: "Bank Transfer", notes: "Feb electricity bill" },
  { id: "6", amount: 32.00, category: "Food & Dining", date: "2026-02-21", tags: ["groceries"], paymentMethod: "Debit Card", notes: "Weekly groceries" },
  { id: "7", amount: 15.00, category: "Transportation", date: "2026-02-20", tags: ["uber"], paymentMethod: "UPI", notes: "Airport ride" },
  { id: "8", amount: 200.00, category: "Healthcare", date: "2026-02-19", tags: ["checkup"], paymentMethod: "Cash", notes: "Annual checkup" },
];

export const mockIncomes: Income[] = [
  { id: "1", source: "Salary", amount: 5200, date: "2026-02-01", recurring: true },
  { id: "2", source: "Freelance", amount: 800, date: "2026-02-15", recurring: false },
  { id: "3", source: "Dividends", amount: 150, date: "2026-02-10", recurring: true },
];

export const mockBudgets: Budget[] = [
  { id: "1", category: "Food & Dining", limit: 500, spent: 377.50, month: "2026-02" },
  { id: "2", category: "Transportation", limit: 300, spent: 135.00, month: "2026-02" },
  { id: "3", category: "Entertainment", limit: 200, spent: 189.99, month: "2026-02" },
  { id: "4", category: "Shopping", limit: 400, spent: 250.00, month: "2026-02" },
  { id: "5", category: "Utilities", limit: 150, spent: 75.00, month: "2026-02" },
  { id: "6", category: "Healthcare", limit: 300, spent: 200.00, month: "2026-02" },
];

export const mockSavingsGoals: SavingsGoal[] = [
  { id: "1", name: "Emergency Fund", targetAmount: 10000, currentAmount: 6500, deadline: "2026-06-30", icon: "🛡️" },
  { id: "2", name: "Vacation", targetAmount: 3000, currentAmount: 1200, deadline: "2026-08-15", icon: "✈️" },
  { id: "3", name: "New Laptop", targetAmount: 2000, currentAmount: 1800, deadline: "2026-04-01", icon: "💻" },
  { id: "4", name: "Investment Fund", targetAmount: 15000, currentAmount: 4200, deadline: "2026-12-31", icon: "📈" },
];

export const mockMonthlyData: MonthlyData[] = [
  { month: "Sep", income: 5800, expenses: 3900, savings: 1900 },
  { month: "Oct", income: 6100, expenses: 4200, savings: 1900 },
  { month: "Nov", income: 5500, expenses: 3600, savings: 1900 },
  { month: "Dec", income: 7200, expenses: 5100, savings: 2100 },
  { month: "Jan", income: 6000, expenses: 4000, savings: 2000 },
  { month: "Feb", income: 6150, expenses: 3227, savings: 2923 },
];

export const categoryColors: Record<string, string> = {
  "Food & Dining": "hsl(var(--chart-food))",
  "Transportation": "hsl(var(--chart-transport))",
  "Entertainment": "hsl(var(--chart-entertainment))",
  "Shopping": "hsl(var(--chart-shopping))",
  "Utilities": "hsl(var(--chart-utilities))",
  "Healthcare": "hsl(var(--chart-income))",
  "Education": "hsl(var(--chart-savings))",
  "Travel": "hsl(var(--chart-transport))",
  "Other": "hsl(var(--muted-foreground))",
};
