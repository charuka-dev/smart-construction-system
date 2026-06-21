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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RoomStatus } from "@/lib/types";
import { toast } from "sonner";
import { RoomStatusBadge } from "@/components/ui-bits";

export const Route = createFileRoute("/supervisor/progress")({
  head: () => ({ meta: [{ title: "Daily Progress — BuildSync-3D" }] }),
  component: SupervisorProgress,
});

function SupervisorProgress() {
  const { projects, currentUser, progress, addProgress, updateRoom } = useApp();
  const mine = projects.filter((p) => p.supervisorId === currentUser?.id);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const project = mine.find((p) => p.id === pid);
  const [roomId, setRoomId] = useState(project?.rooms[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<RoomStatus>("in_progress");
  const [photoUrl, setPhotoUrl] = useState("");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !project || !roomId) return;
    addProgress({
      projectId: project.id,
      roomId,
      note,
      status,
      photoUrl: photoUrl || undefined,
      date: new Date().toISOString().slice(0, 10),
      loggedBy: currentUser.id,
    });
    updateRoom(project.id, roomId, { status });
    setNote("");
    setPhotoUrl("");
    toast.success("Progress uploaded.");
  };

  const recent = progress.filter((pl) => pl.projectId === pid).slice(0, 8);

  return (
    <RoleShell role="supervisor" title="Upload daily progress" nav={supervisorNav}>
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
                <Label>Room / area</Label>
                <Select value={roomId} onValueChange={setRoomId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {project?.rooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>What was done</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RoomStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not started</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Photo (optional)</Label>
              <Input type="file" accept="image/*" onChange={onFile} />
              {photoUrl && <img src={photoUrl} alt="" className="mt-2 rounded-md border border-border max-h-40" />}
            </div>
            <Button type="submit">Upload progress</Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-3">Recent updates</h3>
          {recent.length === 0 ? (
            <div className="text-sm text-muted-foreground">No updates yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((pl) => {
                const r = project?.rooms.find((x) => x.id === pl.roomId);
                return (
                  <div key={pl.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{r?.name ?? pl.roomId}</div>
                      <div className="text-sm text-muted-foreground">{pl.note}</div>
                      <div className="font-mono text-xs text-muted-foreground mt-1">{pl.date}</div>
                    </div>
                    <RoomStatusBadge status={pl.status} />
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
