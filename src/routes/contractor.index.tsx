import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { contractorNav } from "@/components/nav-configs";
import { StatCard, fmtMoney } from "@/components/ui-bits";
import { Card } from "@/components/ui/card";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const Route = createFileRoute("/contractor/")({
  head: () => ({
    meta: [
      { title: "Contractor Analytics — BuildSync-3D" },
      { name: "description", content: "Cross-project rollup of completion, delay, budget vs actual." },
    ],
  }),
  component: ContractorAnalytics,
});

function ContractorAnalytics() {
  const { projects, expenses, progress } = useApp();

  const rows = useMemo(
    () => projects.filter((p) => p.status !== "pending" && p.status !== "rejected").map((p) => {
      const actual = expenses.filter((e) => e.projectId === p.id).reduce((s, e) => s + e.amount, 0);
      const totalRooms = p.rooms.length;
      const doneRooms = p.rooms.filter((r) => r.status === "done").length;
      const completion = totalRooms ? Math.round((doneRooms / totalRooms) * 100) : 0;
      const dueMilestones = p.milestones.filter((m) => m.status !== "done");
      const lateDays = dueMilestones.reduce((s, m) => {
        const diff = Math.floor((Date.now() - new Date(m.dueDate).getTime()) / 86400000);
        return s + Math.max(0, diff);
      }, 0);
      return { name: p.name.split(" — ")[0], budget: p.budget, actual, completion, lateDays };
    }),
    [projects, expenses],
  );

  const avgCompletion = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.completion, 0) / rows.length)
    : 0;
  const avgDelay = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.lateDays, 0) / rows.length)
    : 0;

  return (
    <RoleShell role="contractor" title="Cross-project analytics" nav={contractorNav}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active projects" value={String(rows.length)} />
        <StatCard label="Avg completion" value={`${avgCompletion}%`} />
        <StatCard label="Avg delay" value={`${avgDelay} days`} hint="vs milestone due dates" />
        <StatCard label="Progress logs (total)" value={String(progress.length)} />
      </div>

      <Card className="p-5 mt-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Budget vs actual — by project
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={rows}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmtMoney(v)} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="budget" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </RoleShell>
  );
}
