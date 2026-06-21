import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { supervisorNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard, fmtMoney } from "@/components/ui-bits";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/supervisor/")({
  head: () => ({ meta: [{ title: "Project Analytics — BuildSync-3D" }] }),
  component: SupervisorAnalytics,
});

function SupervisorAnalytics() {
  const { projects, currentUser, expenses } = useApp();
  const mine = projects.filter((p) => p.supervisorId === currentUser?.id);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const project = mine.find((p) => p.id === pid);

  const actual = useMemo(
    () => expenses.filter((e) => e.projectId === pid).reduce((s, e) => s + e.amount, 0),
    [expenses, pid],
  );

  const completion = project
    ? Math.round((project.rooms.filter((r) => r.status === "done").length / project.rooms.length) * 100)
    : 0;
  const lateDays = project
    ? project.milestones
        .filter((m) => m.status !== "done")
        .reduce((s, m) => s + Math.max(0, Math.floor((Date.now() - new Date(m.dueDate).getTime()) / 86400000)), 0)
    : 0;

  return (
    <RoleShell role="supervisor" title="Project analytics" nav={supervisorNav}>
      <div className="mb-4 max-w-md space-y-1.5">
        <Label>Project</Label>
        <Select value={pid} onValueChange={setPid}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {mine.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {project ? (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard label="Completion" value={`${completion}%`} />
            <StatCard label="Delay" value={`${lateDays} days`} hint="vs milestone due dates" />
            <StatCard label="Actual spend" value={fmtMoney(actual)} hint={`Budget ${fmtMoney(project.budget)}`} />
          </div>
          <Card className="p-5 mt-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Budget vs actual
            </div>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={[{ name: project.name, budget: project.budget, actual }]}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => fmtMoney(v)} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Bar dataKey="budget" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">No projects assigned yet.</Card>
      )}
    </RoleShell>
  );
}
