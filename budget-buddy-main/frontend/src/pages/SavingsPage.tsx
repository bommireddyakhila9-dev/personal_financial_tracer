import { useQuery } from "@tanstack/react-query";
import { getSavingsGoals } from "@/lib/supabase-data";

export default function SavingsPage() {
  const goalsQuery = useQuery({ queryKey: ["savings-goals"], queryFn: getSavingsGoals });
  const goals = goalsQuery.data ?? [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Savings Goals</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your progress towards financial goals</p>
      </div>

      {goalsQuery.isLoading ? (
        <div className="glass-card p-8 text-center text-muted-foreground">Loading savings goals...</div>
      ) : goalsQuery.isError ? (
        <div className="glass-card p-8 text-center text-destructive">Failed to load goals from Supabase.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
            const remaining = g.targetAmount - g.currentAmount;
            const daysLeft = Math.max(0, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000));
            const perDay = daysLeft > 0 ? remaining / daysLeft : 0;

            return (
              <div key={g.id} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{g.icon}</span>
                  <div>
                    <h3 className="font-semibold">{g.name}</h3>
                    <p className="text-xs text-muted-foreground">{daysLeft} days left - Due {g.deadline}</p>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold font-mono">${g.currentAmount.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground font-mono">${g.targetAmount.toLocaleString()}</span>
                </div>

                <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{pct}% complete</span>
                  <span>${remaining.toLocaleString()} to go - ~${perDay.toFixed(0)}/day</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
