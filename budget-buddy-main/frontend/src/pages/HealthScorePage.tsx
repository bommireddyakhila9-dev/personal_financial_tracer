import { Heart, TrendingUp, Shield, Target, Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBudgets, getExpenses, getIncomes } from "@/lib/supabase-data";

function getScoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

const suggestions = [
  { icon: Target, text: "Increase your savings target once your emergency fund is on track." },
  { icon: Shield, text: "Keep categories near their budget limits under watch each week." },
  { icon: TrendingUp, text: "Compare month-over-month spending trends to reduce recurring costs." },
  { icon: Lightbulb, text: "Set up automatic transfers for savings goals after income deposits." },
];

export default function HealthScorePage() {
  const expensesQuery = useQuery({ queryKey: ["expenses"], queryFn: getExpenses });
  const incomesQuery = useQuery({ queryKey: ["incomes"], queryFn: getIncomes });
  const budgetsQuery = useQuery({ queryKey: ["budgets"], queryFn: getBudgets });

  const expenses = expensesQuery.data ?? [];
  const incomes = incomesQuery.data ?? [];
  const budgets = budgetsQuery.data ?? [];

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  const budgetDiscipline = budgets.length > 0 ? budgets.reduce((acc, b) => acc + (b.spent <= b.limit ? 1 : 0), 0) / budgets.length * 100 : 0;
  const healthScore = Math.round((savingsRate * 0.4 + budgetDiscipline * 0.4 + 20 * 0.2));

  if (expensesQuery.isLoading || incomesQuery.isLoading || budgetsQuery.isLoading) {
    return <div className="glass-card p-8 text-center text-muted-foreground">Loading health score...</div>;
  }

  if (expensesQuery.isError || incomesQuery.isError || budgetsQuery.isError) {
    return <div className="glass-card p-8 text-center text-destructive">Failed to load health score data from Supabase.</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Financial Health</h1>
        <p className="text-muted-foreground text-sm mt-1">Your overall financial wellness score</p>
      </div>

      <div className="glass-card p-8 text-center">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary/20 mb-4 relative">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="58" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
            <circle
              cx="64" cy="64" r="58" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(healthScore / 100) * 364.4} 364.4`}
            />
          </svg>
          <div className="z-10">
            <span className={`text-4xl font-bold font-mono ${getScoreColor(healthScore)}`}>{healthScore}</span>
            <p className="text-xs text-muted-foreground">/100</p>
          </div>
        </div>
        <p className={`text-lg font-semibold ${getScoreColor(healthScore)}`}>{getScoreLabel(healthScore)}</p>
        <p className="text-sm text-muted-foreground mt-1">Based on savings rate, budget discipline, and financial habits</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <p className="text-sm text-muted-foreground mb-1">Savings Rate</p>
          <p className="text-2xl font-bold font-mono">{savingsRate.toFixed(1)}%</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-sm text-muted-foreground mb-1">Budget Discipline</p>
          <p className="text-2xl font-bold font-mono">{budgetDiscipline.toFixed(0)}%</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-sm text-muted-foreground mb-1">Debt Ratio</p>
          <p className="text-2xl font-bold font-mono">0%</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recommendations</h3>
        </div>
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <s.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
