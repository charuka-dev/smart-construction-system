import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { contractorNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/contractor/quality")({
  head: () => ({ meta: [{ title: "Quality & approval — BuildSync-3D" }] }),
  component: Quality,
});

function Quality() {
  const { projects, quality } = useApp();
  const [pid, setPid] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => quality
    .filter((q) => (pid === "all" ? true : q.projectId === pid))
    .filter((q) => (status === "all" ? true : q.status === status))
    .sort((a, b) => b.date.localeCompare(a.date)),
    [quality, pid, status]);

  return (
    <RoleShell role="contractor" title="Quality & approval management" nav={contractorNav}>
      <div className="flex items-end gap-3 mb-4">
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select value={pid} onValueChange={setPid}>
            <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="issue">Issue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-5">
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No inspections.</div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((q) => {
              const project = projects.find((p) => p.id === q.projectId);
              const room = project?.rooms.find((r) => r.id === q.roomId);
              return (
                <div key={q.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${q.status === "ok" ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
                        {q.status}
                      </span>
                      <div className="text-sm font-medium">{project?.name} · {room?.name ?? q.roomId}</div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{q.notes}</div>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground shrink-0">{q.date}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </RoleShell>
  );
}
