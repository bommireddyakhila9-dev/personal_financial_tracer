import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addExpense, deleteExpense, getExpenses } from "@/lib/supabase-data";
import { CATEGORIES, PAYMENT_METHODS, categoryColors, type Expense } from "@/lib/finance-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [newCategory, setNewCategory] = useState<string>("");
  const [newPaymentMethod, setNewPaymentMethod] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const expensesQuery = useQuery({ queryKey: ["expenses"], queryFn: getExpenses });

  const addMutation = useMutation({
    mutationFn: addExpense,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      await queryClient.invalidateQueries({ queryKey: ["incomes"] });
      await queryClient.invalidateQueries({ queryKey: ["budgets"] });
      await queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      setIsOpen(false);
      setNewCategory("");
      setNewPaymentMethod("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      await queryClient.invalidateQueries({ queryKey: ["incomes"] });
      await queryClient.invalidateQueries({ queryKey: ["budgets"] });
      await queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
    },
  });

  const expenses = expensesQuery.data ?? [];

  const filtered = expenses.filter((e) => {
    const matchSearch = e.notes.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || e.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCategory || !newPaymentMethod) return;

    const form = new FormData(e.currentTarget);
    const payload: Omit<Expense, "id"> = {
      amount: parseFloat(form.get("amount") as string),
      category: newCategory,
      date: form.get("date") as string,
      tags: (form.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean),
      paymentMethod: newPaymentMethod,
      notes: (form.get("notes") as string) || "",
    };

    await addMutation.mutateAsync(payload);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage your spending</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Amount</Label><Input name="amount" type="number" step="0.01" required placeholder="0.00" /></div>
                <div><Label>Date</Label><Input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} /></div>
              </div>
              <div><Label>Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Payment Method</Label>
                <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                  <SelectTrigger><SelectValue placeholder="Payment method" /></SelectTrigger>
                  <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Input name="notes" placeholder="What was this for?" /></div>
              <div><Label>Tags (comma-separated)</Label><Input name="tags" placeholder="food, lunch" /></div>
              <Button type="submit" className="w-full" disabled={addMutation.isPending}>Add Expense</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search expenses..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {expensesQuery.isLoading ? (
        <div className="glass-card p-8 text-center text-muted-foreground">Loading expenses...</div>
      ) : expensesQuery.isError ? (
        <div className="glass-card p-8 text-center text-destructive">Failed to load expenses from Supabase.</div>
      ) : (
        <div className="glass-card divide-y divide-border/30">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No expenses found</div>
          ) : (
            filtered.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: categoryColors[e.category] }} />
                  <div>
                    <p className="text-sm font-medium">{e.notes || e.category}</p>
                    <p className="text-xs text-muted-foreground">{e.category} - {e.paymentMethod} - {e.date}</p>
                    {e.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {e.tags.map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-destructive">-${e.amount.toFixed(2)}</span>
                  <button onClick={() => void handleDelete(e.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
