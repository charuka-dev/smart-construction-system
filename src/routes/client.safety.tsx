import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { clientNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/client/safety")({
  head: () => ({ meta: [{ title: "Safety Issues — BuildSync-3D" }] }),
  component: ClientSafety,
});

function ClientSafety() {
  const { projects, currentUser, safety } = useApp();
  const mine = projects.filter((p) => p.clientId === currentUser?.id);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const rows = safety.filter((s) => s.projectId === pid).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <RoleShell role="client" title="Safety issues" nav={clientNav}>
      <div className="mb-4 max-w-md space-y-1.5">
        <Label>Project</Label>
        <Select value={pid} onValueChange={setPid}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {mine.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-5">
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No safety issues reported.</div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((s) => (
              <div key={s.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{s.description}</div>
                  <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${s.resolved ? "border-success/40 bg-success/10" : "border-warning/40 bg-warning/10"}`}>
                    {s.resolved ? "Resolved" : "Open"}
                  </span>
                </div>
                <div className="font-mono text-xs text-muted-foreground mt-1">{s.date}</div>
                <div className="text-sm text-muted-foreground mt-1">Work stopped: {s.reasonWorkStopped}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </RoleShell>
  );
}
