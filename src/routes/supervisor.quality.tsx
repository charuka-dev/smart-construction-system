import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { supervisorNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/supervisor/quality")({
  head: () => ({ meta: [{ title: "Quality Inspection — BuildSync-3D" }] }),
  component: SupQuality,
});

function SupQuality() {
  const { projects, currentUser, quality, addQuality } = useApp();
  const mine = projects.filter((p) => p.supervisorId === currentUser?.id);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const project = mine.find((p) => p.id === pid);
  const [roomId, setRoomId] = useState(project?.rooms[0]?.id ?? "");
  const [status, setStatus] = useState<"ok" | "issue">("ok");
  const [notes, setNotes] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !project || !roomId) return;
    addQuality({
      projectId: project.id,
      roomId,
      status,
      notes,
      date: new Date().toISOString().slice(0, 10),
      supervisorId: currentUser.id,
    });
    setNotes("");
    toast.success("Inspection recorded.");
  };

  const rows = quality.filter((q) => q.projectId === pid).slice(0, 8);

  return (
    <RoleShell role="supervisor" title="Quality inspection management" nav={supervisorNav}>
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <Card className="p-5">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Project</Label>
                <Select value={pid} onValueChange={(v) => { setPid(v); const p = mine.find(x => x.id === v); setRoomId(p?.rooms[0]?.id ?? ""); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {mine.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Room / part</Label>
                <Select value={roomId} onValueChange={setRoomId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {project?.rooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "ok" | "issue")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ok">OK</SelectItem>
                  <SelectItem value="issue">Issue / delay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Notes — reason for delay / quality problem</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
            </div>
            <Button type="submit">Record inspection</Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3">Recent inspections</h3>
          {rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">None yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((q) => {
                const r = project?.rooms.find((x) => x.id === q.roomId);
                return (
                  <div key={q.id} className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">{r?.name ?? q.roomId}</div>
                      <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${q.status === "ok" ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
                        {q.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{q.notes}</div>
                    <div className="font-mono text-xs text-muted-foreground mt-1">{q.date}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </RoleShell>
  );
}
