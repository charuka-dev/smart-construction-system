import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { clientNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtMoney } from "@/components/ui-bits";

export const Route = createFileRoute("/client/costs")({
  head: () => ({ meta: [{ title: "Cost Estimate — BuildSync-3D" }] }),
  component: CostEstimate,
});

function CostEstimate() {
  const { projects, currentUser, expenses } = useApp();
  const mine = projects.filter((p) => p.clientId === currentUser?.id);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const [mode, setMode] = useState<"daily" | "monthly">("daily");

  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const items = useMemo(() => expenses.filter((e) => e.projectId === pid), [expenses, pid]);
  const dailyItems = items.filter((e) => e.date === today);
  const monthlyItems = items.filter((e) => e.date.startsWith(month));

  const monthByCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of monthlyItems) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    return Array.from(map.entries());
  }, [monthlyItems]);

  return (
    <RoleShell role="client" title="Cost estimate" nav={clientNav}>
      <div className="flex items-end gap-3 mb-4 flex-wrap">
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select value={pid} onValueChange={setPid}>
            <SelectTrigger className="w-80"><SelectValue /></SelectTrigger>
            <SelectContent>
              {mine.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1 p-1 rounded-md bg-muted font-mono text-xs uppercase tracking-wider">
          <button onClick={() => setMode("daily")} className={`px-4 py-1.5 rounded ${mode === "daily" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Daily</button>
          <button onClick={() => setMode("monthly")} className={`px-4 py-1.5 rounded ${mode === "monthly" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Monthly</button>
        </div>
      </div>

      {mode === "daily" ? (
        <Card className="p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Today · {today}</div>
          {dailyItems.length === 0 ? (
            <div className="text-sm text-muted-foreground mt-3">No expenses today.</div>
          ) : (
            <table className="w-full text-sm mt-3">
              <thead className="text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="py-2">Category</th><th>Description</th><th className="text-right">Amount</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dailyItems.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 capitalize">{e.category}</td>
                    <td>{e.description}</td>
                    <td className="text-right font-mono">{fmtMoney(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td colSpan={2} className="py-2 font-medium">Total</td>
                  <td className="py-2 text-right font-mono font-semibold">{fmtMoney(dailyItems.reduce((s, e) => s + e.amount, 0))}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Month · {month}</div>
            <div className="mt-2 font-display text-3xl font-semibold">{fmtMoney(monthlyItems.reduce((s, e) => s + e.amount, 0))}</div>
            <div className="text-xs text-muted-foreground mt-1">{monthlyItems.length} entries</div>
          </Card>
          <Card className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Breakdown by category</div>
            {monthByCat.length === 0 ? (
              <div className="text-sm text-muted-foreground">No expenses this month.</div>
            ) : (
              <div className="space-y-2">
                {monthByCat.map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="capitalize">{cat}</span>
                    <span className="font-mono">{fmtMoney(amt)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </RoleShell>
  );
}
