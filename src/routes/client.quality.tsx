import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { clientNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/client/quality")({
  head: () => ({ meta: [{ title: "Quality Inspection — BuildSync-3D" }] }),
  component: ClientQuality,
});

function ClientQuality() {
  const { projects, currentUser, quality } = useApp();
  const mine = projects.filter((p) => p.clientId === currentUser?.id);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const project = mine.find((p) => p.id === pid);
  const rows = quality.filter((q) => q.projectId === pid);

  return (
    <RoleShell role="client" title="Quality inspections" nav={clientNav}>
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
        {!project ? (
          <div className="text-sm text-muted-foreground">No project.</div>
        ) : (
          <div className="divide-y divide-border">
            {project.rooms.map((r) => {
              const items = rows.filter((q) => q.roomId === r.id);
              const finished = items.some((q) => q.status === "ok");
              const issue = items.some((q) => q.status === "issue");
              return (
                <div key={r.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    {items.length > 0 ? (
                      <div className="text-sm text-muted-foreground mt-1">
                        {items[items.length - 1].notes}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground mt-1">No inspections yet.</div>
                    )}
                  </div>
                  <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${
                    issue ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : finished ? "border-success/40 bg-success/10"
                      : "border-border text-muted-foreground"
                  }`}>
                    {issue ? "Issue raised" : finished ? "Finished" : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </RoleShell>
  );
}
