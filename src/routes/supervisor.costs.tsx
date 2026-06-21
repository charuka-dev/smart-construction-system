import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { supervisorNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExpenseCategory } from "@/lib/types";
import { toast } from "sonner";
import { fmtMoney } from "@/components/ui-bits";

export const Route = createFileRoute("/supervisor/costs")({
  head: () => ({ meta: [{ title: "Daily Cost — BuildSync-3D" }] }),
  component: SupCosts,
});

function SupCosts() {
  const { projects, currentUser, expenses, addExpense } = useApp();
  const mine = projects.filter((p) => p.supervisorId === currentUser?.id);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const [form, setForm] = useState({
    category: "materials" as ExpenseCategory,
    description: "",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pid || !form.description || !form.amount) {
      toast.error("Fill description and amount.");
      return;
    }
    addExpense({ projectId: pid, ...form });
    setForm({ ...form, description: "", amount: 0 });
    toast.success("Expense logged.");
  };

  const rows = expenses.filter((e) => e.projectId === pid).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <RoleShell role="supervisor" title="Update daily cost" nav={supervisorNav}>
      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        <Card className="p-5">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select value={pid} onValueChange={setPid}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mine.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ExpenseCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="labor">Labor</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (USD)</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </div>
            <Button type="submit">Log expense</Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3">Recent entries</h3>
          {rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">No entries.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="py-2">Date</th><th>Category</th><th>Description</th><th className="text-right">Amount</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.slice(0, 12).map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 font-mono text-xs">{e.date}</td>
                    <td className="capitalize">{e.category}</td>
                    <td>{e.description}</td>
                    <td className="text-right font-mono">{fmtMoney(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </RoleShell>
  );
}
