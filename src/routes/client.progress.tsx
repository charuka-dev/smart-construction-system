import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { clientNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Scene3D } from "@/components/Scene3D";
import { RoomStatusBadge } from "@/components/ui-bits";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/client/progress")({
  head: () => ({ meta: [{ title: "Track Progress — BuildSync-3D" }] }),
  component: TrackProgress,
});

function TrackProgress() {
  const { projects, currentUser, progress } = useApp();
  const mine = projects.filter((p) => p.clientId === currentUser?.id && p.status !== "rejected");
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const project = mine.find((p) => p.id === pid);

  const today = new Date().toISOString().slice(0, 10);
  const todays = useMemo(
    () => progress.filter((pl) => pl.projectId === pid && pl.date === today),
    [progress, pid, today],
  );
  const activeRoomId = todays[0]?.roomId ?? null;

  return (
    <RoleShell role="client" title="Track progress" nav={clientNav}>
      <div className="mb-4 max-w-md space-y-1.5">
        <Label>Project</Label>
        <Select value={pid} onValueChange={setPid}>
          <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
          <SelectContent>
            {mine.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {project ? (
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
          <Card className="p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Today's active work area is highlighted in terracotta
            </div>
            <Scene3D rooms={project.rooms} highlightedRoomId={activeRoomId} height={500} />
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-semibold mb-3">Today's site notes</h3>
            {todays.length === 0 ? (
              <div className="text-sm text-muted-foreground">No work logged today.</div>
            ) : (
              <div className="space-y-3">
                {todays.map((pl) => {
                  const r = project.rooms.find((x) => x.id === pl.roomId);
                  return (
                    <div key={pl.id} className="rounded-md border border-border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium">{r?.name}</div>
                        <RoomStatusBadge status={pl.status} />
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{pl.note}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <h3 className="font-display font-semibold mt-6 mb-3">All rooms</h3>
            <div className="divide-y divide-border">
              {project.rooms.map((r) => (
                <div key={r.id} className="py-2 flex items-center justify-between">
                  <div className="text-sm">{r.name}</div>
                  <RoomStatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">No projects yet.</Card>
      )}
    </RoleShell>
  );
}
