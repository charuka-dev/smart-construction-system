import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { supervisorNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/supervisor/safety")({
  head: () => ({ meta: [{ title: "Safety & Issues — BuildSync-3D" }] }),
  component: SupSafety,
});

function SupSafety() {
  const { projects, currentUser, safety, addSafety, toggleSafetyResolved } = useApp();
  const mine = projects.filter((p) => p.supervisorId === currentUser?.id);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    reasonWorkStopped: "",
    resolved: false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pid || !form.description) { toast.error("Description required."); return; }
    addSafety({ projectId: pid, ...form });
    setForm({ ...form, description: "", reasonWorkStopped: "" });
    toast.success("Safety issue reported.");
  };

  const rows = safety.filter((s) => s.projectId === pid).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <RoleShell role="supervisor" title="Safety & issue reporting" nav={supervisorNav}>
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <Card className="p-5">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Project</Label>
                <Select value={pid} onValueChange={setPid}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {mine.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
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
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Reason work was stopped</Label>
              <Textarea value={form.reasonWorkStopped} onChange={(e) => setForm({ ...form, reasonWorkStopped: e.target.value })} rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.resolved} onCheckedChange={(v) => setForm({ ...form, resolved: v })} />
              <span className="text-sm">Resolved</span>
            </div>
            <Button type="submit">Report issue</Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3">Reported issues</h3>
          {rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">None yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((s) => (
                <div key={s.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{s.description}</div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${s.resolved ? "border-success/40 bg-success/10" : "border-warning/40 bg-warning/10"}`}>
                        {s.resolved ? "Resolved" : "Open"}
                      </span>
                      <Switch checked={s.resolved} onCheckedChange={() => toggleSafetyResolved(s.id)} />
                    </div>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground mt-1">{s.date}</div>
                  <div className="text-sm text-muted-foreground mt-1">Work stopped: {s.reasonWorkStopped}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </RoleShell>
  );
}
