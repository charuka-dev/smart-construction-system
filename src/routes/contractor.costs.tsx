import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { contractorNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtMoney } from "@/components/ui-bits";

export const Route = createFileRoute("/contractor/costs")({
  head: () => ({ meta: [{ title: "Cost & Budget — BuildSync-3D" }] }),
  component: Costs,
});

function Costs() {
  const { projects, expenses, updateProject } = useApp();
  const [pid, setPid] = useState(projects[0]?.id ?? "");
  const project = projects.find((p) => p.id === pid);
  const items = useMemo(
    () => expenses.filter((e) => e.projectId === pid).sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, pid],
  );
  const total = items.reduce((s, e) => s + e.amount, 0);

  return (
    <RoleShell role="contractor" title="Cost & budget management" nav={contractorNav}>
      <div className="flex items-end gap-3 mb-4 flex-wrap">
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select value={pid} onValueChange={setPid}>
            <SelectTrigger className="w-80"><SelectValue /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {project && (
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Estimated cost</div>
            <Input type="number" className="mt-2 font-display text-2xl h-12" defaultValue={project.estimatedCost}
              onBlur={(e) => updateProject(project.id, { estimatedCost: Number(e.target.value) })} />
          </Card>
          <Card className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Budget</div>
            <Input type="number" className="mt-2 font-display text-2xl h-12" defaultValue={project.budget}
              onBlur={(e) => updateProject(project.id, { budget: Number(e.target.value) })} />
          </Card>
          <Card className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Actual spent</div>
            <div className="mt-2 font-display text-2xl font-semibold">{fmtMoney(total)}</div>
            <div className="text-xs text-muted-foreground mt-1">{items.length} entries</div>
          </Card>
        </div>
      )}

      <Card className="p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Daily expense log (read-only — supervisor entered)
        </div>
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No expenses logged yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2">Date</th><th>Category</th><th>Description</th><th className="text-right">Amount</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((e) => (
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
    </RoleShell>
  );
}
