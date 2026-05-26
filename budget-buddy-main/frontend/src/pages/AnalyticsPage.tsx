import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getExpenses, getIncomes } from "@/lib/supabase-data";
import { categoryColors, type MonthlyData } from "@/lib/finance-types";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

function buildMonthlyData(
  incomes: { amount: number; date: string }[],
  expenses: { amount: number; date: string }[]
): MonthlyData[] {
  const now = new Date();
  const months: { year: number; monthIndex: number; label: string }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }

  return months.map(({ year, monthIndex, label }) => {
    const income = incomes
      .filter((i) => {
        const d = new Date(i.date);
        return d.getFullYear() === year && d.getMonth() === monthIndex;
      })
      .reduce((sum, i) => sum + i.amount, 0);

    const expense = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === monthIndex;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      month: label,
      income,
      expenses: expense,
      savings: income - expense,
    };
  });
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

export default function AnalyticsPage() {
  const expensesQuery = useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses,
  });

  const incomesQuery = useQuery({
    queryKey: ["incomes"],
    queryFn: getIncomes,
  });

  const expenses = expensesQuery.data ?? [];
  const incomes = incomesQuery.data ?? [];

  // ✅ Totals
  const totalIncome = useMemo(
    () => incomes.reduce((sum, i) => sum + i.amount, 0),
    [incomes]
  );

  const totalExpense = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const netSavings = totalIncome - totalExpense;

  // ✅ Category Breakdown
  const categoryData = useMemo(() => {
    return Object.entries(
      expenses.reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {})
    ).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));
  }, [expenses]);

  // ✅ Monthly Data
  const monthlyData = useMemo(
    () => buildMonthlyData(incomes, expenses),
    [incomes, expenses]
  );

  if (expensesQuery.isLoading || incomesQuery.isLoading) {
    return (
      <div className="glass-card p-8 text-center text-muted-foreground">
        Loading analytics...
      </div>
    );
  }

  if (expensesQuery.isError || incomesQuery.isError) {
    return (
      <div className="glass-card p-8 text-center text-destructive">
        Failed to load analytics data.
      </div>
    );
  }

  if (!expenses.length && !incomes.length) {
    return (
      <div className="glass-card p-8 text-center text-muted-foreground">
        No financial data available yet. Start adding income and expenses.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Detailed financial reports and insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="text-xl font-semibold text-green-500">
            ${totalIncome.toLocaleString()}
          </p>
        </div>

        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-xl font-semibold text-red-500">
            ${totalExpense.toLocaleString()}
          </p>
        </div>

        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Net Savings</p>
          <p
            className={`text-xl font-semibold ${
              netSavings >= 0 ? "text-blue-500" : "text-red-500"
            }`}
          >
            ${netSavings.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Income vs Expenses */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">Income vs Expenses</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="income" fill="hsl(var(--chart-income))" />
              <Bar dataKey="expenses" fill="hsl(var(--chart-expense))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Savings Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Savings Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="hsl(var(--chart-savings))"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Spending Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        categoryColors[entry.name] ||
                        "hsl(var(--muted))"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}