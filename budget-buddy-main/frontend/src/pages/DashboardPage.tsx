import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, PiggyBank, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBudgets, getExpenses, getIncomes, getSavingsGoals } from "@/lib/supabase-data";
import type { MonthlyData } from "@/lib/finance-types";
import { categoryColors } from "@/lib/finance-types";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

function StatCard({ title, value, change, positive, icon: Icon }: {
  title: string; value: string; change: string; positive: boolean; icon: React.ElementType;
}) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold font-mono tracking-tight">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {positive ? (
          <ArrowUpRight className="h-3 w-3 text-success" />
        ) : (
          <ArrowDownRight className="h-3 w-3 text-destructive" />
        )}
        <span className={`text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
          {change}
        </span>
        <span className="text-xs text-muted-foreground">vs last month</span>
      </div>
    </div>
  );
}

function buildMonthlyData(incomes: { amount: number; date: string }[], expenses: { amount: number; date: string }[]): MonthlyData[] {
  const now = new Date();
  const months: { key: string; month: string }[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const month = d.toLocaleDateString("en-US", { month: "short" });
    months.push({ key, month });
  }

  return months.map(({ key, month }) => {
    const income = incomes.filter((i) => i.date.startsWith(key)).reduce((sum, i) => sum + i.amount, 0);
    const expense = expenses.filter((e) => e.date.startsWith(key)).reduce((sum, e) => sum + e.amount, 0);

    return {
      month,
      income,
      expenses: expense,
      savings: income - expense,
    };
  });
}

function getQueryErrorMessage(errors: unknown[]): string {
  const error = errors.find(Boolean);

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Check your Supabase URL, anon key, table schema, and network connection.";
}

export default function DashboardPage() {
  const expensesQuery = useQuery({ queryKey: ["expenses"], queryFn: getExpenses });
  const incomesQuery = useQuery({ queryKey: ["incomes"], queryFn: getIncomes });
  const budgetsQuery = useQuery({ queryKey: ["budgets"], queryFn: getBudgets });
  const goalsQuery = useQuery({ queryKey: ["savings-goals"], queryFn: getSavingsGoals });

  const expenses = expensesQuery.data ?? [];
  const incomes = incomesQuery.data ?? [];
  const budgets = budgetsQuery.data ?? [];
  const goals = goalsQuery.data ?? [];

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalSavings = totalIncome - totalExpenses;

  const categoryData = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));

  const monthlyData = buildMonthlyData(incomes, expenses);
  const isLoading = expensesQuery.isLoading || incomesQuery.isLoading || budgetsQuery.isLoading || goalsQuery.isLoading;
  const hasError = expensesQuery.isError || incomesQuery.isError || budgetsQuery.isError || goalsQuery.isError;

  if (isLoading) {
    return <div className="glass-card p-8 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  if (hasError) {
    const message = getQueryErrorMessage([
      expensesQuery.error,
      incomesQuery.error,
      budgetsQuery.error,
      goalsQuery.error,
    ]);

    return (
      <div className="glass-card p-8 text-center text-destructive">
        <p>Failed to load dashboard data from Supabase.</p>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your live financial overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Income" value={`$${totalIncome.toLocaleString()}`} change="Live" positive icon={DollarSign} />
        <StatCard title="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} change="Live" positive={false} icon={CreditCard} />
        <StatCard title="Savings" value={`$${totalSavings.toLocaleString()}`} change="Live" positive={totalSavings >= 0} icon={PiggyBank} />
        <StatCard title="Savings Rate" value={`${totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0}%`} change="Live" positive={totalSavings >= 0} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Spending Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-income))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-income))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-expense))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-expense))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
                <Area type="monotone" dataKey="income" stroke="hsl(var(--chart-income))" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="hsl(var(--chart-expense))" fill="url(#expenseGrad)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">By Category</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={categoryColors[entry.name] || "hsl(var(--muted))"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [`$${value}`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[c.name] }} />
                  <span className="text-muted-foreground">{c.name}</span>
                </div>
                <span className="font-mono font-medium">${c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {expenses.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-medium">{e.notes || e.category}</p>
                  <p className="text-xs text-muted-foreground">{e.category} - {e.date}</p>
                </div>
                <span className="font-mono text-sm font-semibold text-destructive">-${e.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Budget Progress</h3>
          <div className="space-y-4">
            {budgets.slice(0, 4).map((b) => {
              const pct = Math.round((b.spent / b.limit) * 100);
              const over = pct > 90;
              return (
                <div key={b.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{b.category}</span>
                    <span className="font-mono text-xs text-muted-foreground">${b.spent} / ${b.limit}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${over ? "bg-warning" : "bg-primary"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">Savings Goals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.map((g) => {
            const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
            return (
              <div key={g.id} className="p-4 rounded-lg bg-muted/50 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{g.icon}</span>
                  <span className="text-sm font-medium">{g.name}</span>
                </div>
                <p className="font-mono text-lg font-bold">${g.currentAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mb-2">of ${g.targetAmount.toLocaleString()}</p>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{pct}% complete</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
