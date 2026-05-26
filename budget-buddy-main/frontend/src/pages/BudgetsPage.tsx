import { AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBudgets } from "@/lib/supabase-data";
import { categoryColors } from "@/lib/finance-types";

export default function BudgetsPage() {
  const budgetsQuery = useQuery({ queryKey: ["budgets"], queryFn: getBudgets });
  const budgets = budgetsQuery.data ?? [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Budgets</h1>
        <p className="text-muted-foreground text-sm mt-1">Track spending against your monthly budgets</p>
      </div>

      {budgetsQuery.isLoading ? (
        <div className="glass-card p-8 text-center text-muted-foreground">Loading budgets...</div>
      ) : budgetsQuery.isError ? (
        <div className="glass-card p-8 text-center text-destructive">Failed to load budgets from Supabase.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const pct = Math.round((b.spent / b.limit) * 100);
            const remaining = b.limit - b.spent;
            const isOver = pct >= 90;
            return (
              <div key={b.id} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[b.category] }} />
                    <h3 className="font-medium">{b.category}</h3>
                  </div>
                  {isOver && (
                    <div className="flex items-center gap-1 text-warning text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{pct >= 100 ? "Over budget!" : "Near limit"}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-mono font-semibold">${b.spent.toFixed(0)}</span>
                  <span className="text-muted-foreground font-mono">${b.limit}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-warning" : "bg-primary"}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {remaining > 0 ? `$${remaining.toFixed(0)} remaining` : `$${Math.abs(remaining).toFixed(0)} over budget`}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
