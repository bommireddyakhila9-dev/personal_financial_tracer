import { useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addIncome, getIncomes } from "@/lib/supabase-data";
import type { Income } from "@/lib/finance-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function IncomePage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const incomesQuery = useQuery({ queryKey: ["incomes"], queryFn: getIncomes });

  const addMutation = useMutation({
    mutationFn: addIncome,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["incomes"] });
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      await queryClient.invalidateQueries({ queryKey: ["budgets"] });
      await queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      setIsOpen(false);
    },
  });

  const incomes = incomesQuery.data ?? [];
  const total = incomes.reduce((s, i) => s + i.amount, 0);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: Omit<Income, "id"> = {
      source: form.get("source") as string,
      amount: parseFloat(form.get("amount") as string),
      date: form.get("date") as string,
      recurring: form.get("recurring") === "on",
    };

    await addMutation.mutateAsync(payload);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Income</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your income sources</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Income</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Income Source</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><Label>Source</Label><Input name="source" required placeholder="e.g. Salary" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Amount</Label><Input name="amount" type="number" step="0.01" required placeholder="0.00" /></div>
                <div><Label>Date</Label><Input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch name="recurring" /><Label>Recurring monthly</Label></div>
              <Button type="submit" className="w-full" disabled={addMutation.isPending}>Add Income</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="stat-card">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Monthly Income</p>
            <p className="text-3xl font-bold font-mono">${total.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {incomesQuery.isLoading ? (
        <div className="glass-card p-8 text-center text-muted-foreground">Loading income...</div>
      ) : incomesQuery.isError ? (
        <div className="glass-card p-8 text-center text-destructive">Failed to load income from Supabase.</div>
      ) : (
        <div className="glass-card divide-y divide-border/30">
          {incomes.map((i) => (
            <div key={i.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{i.source}</p>
                <p className="text-xs text-muted-foreground">{i.date}{i.recurring ? " - Recurring" : ""}</p>
              </div>
              <span className="font-mono text-sm font-semibold text-success">+${i.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
