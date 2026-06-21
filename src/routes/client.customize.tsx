import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { clientNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Scene3D } from "@/components/Scene3D";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Room } from "@/lib/types";

const WALL_SWATCHES = ["#e8dfd1", "#f1eadb", "#dfe7ea", "#d8d2c2", "#c9b8a0", "#a8b5b0", "#2e3a3f"];
const TILES: { key: Room["tileStyle"]; label: string; color: string }[] = [
  { key: "marble_white", label: "Marble (white)", color: "#ece8df" },
  { key: "wood_oak", label: "Oak plank", color: "#b48455" },
  { key: "slate_grey", label: "Slate", color: "#5b6168" },
  { key: "ceramic_blue", label: "Ceramic blue", color: "#7ea4b8" },
  { key: "terracotta", label: "Terracotta", color: "#b86b4b" },
];

export const Route = createFileRoute("/client/customize")({
  head: () => ({ meta: [{ title: "Customize Design — BuildSync-3D" }] }),
  component: Customize,
});

function Customize() {
  const { projects, currentUser, updateRoom } = useApp();
  const mine = projects.filter((p) => p.clientId === currentUser?.id);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const project = mine.find((p) => p.id === pid);
  const [sel, setSel] = useState<{ roomId: string; part: "wall" | "floor" } | null>(null);

  const room = project?.rooms.find((r) => r.id === sel?.roomId) ?? null;

  return (
    <RoleShell role="client" title="Customize design" nav={clientNav}>
      <div className="mb-4 max-w-md space-y-1.5">
        <Label>Project</Label>
        <Select value={pid} onValueChange={(v) => { setPid(v); setSel(null); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {mine.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {project ? (
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* LEFT: material picker driven by selection */}
          <Card className="p-5 h-fit lg:sticky lg:top-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Material picker
            </div>
            {!sel || !room ? (
              <p className="text-sm text-muted-foreground mt-3">
                Click any wall or floor in the 3D view to choose materials for it.
              </p>
            ) : (
              <div className="mt-3">
                <div className="text-sm">
                  <span className="font-medium">{room.name}</span> · {sel.part}
                </div>

                {sel.part === "wall" ? (
                  <div className="mt-4">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Wall colour</div>
                    <div className="grid grid-cols-4 gap-2">
                      {WALL_SWATCHES.map((c) => (
                        <button
                          key={c}
                          aria-label={`Wall colour ${c}`}
                          onClick={() => updateRoom(project.id, room.id, { wallColor: c })}
                          className={`aspect-square rounded-md border-2 transition ${room.wallColor === c ? "border-primary" : "border-border hover:border-foreground/40"}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Floor / tile</div>
                    <div className="space-y-2">
                      {TILES.map((t) => (
                        <button
                          key={t.key}
                          onClick={() => updateRoom(project.id, room.id, { tileStyle: t.key })}
                          className={`w-full flex items-center gap-3 rounded-md border p-2 text-left transition ${room.tileStyle === t.key ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"}`}
                        >
                          <span className="size-8 rounded border border-border" style={{ backgroundColor: t.color }} />
                          <span className="text-sm">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* CENTER/RIGHT: 3D view */}
          <Card className="p-4">
            <Scene3D
              rooms={project.rooms}
              selectedPart={sel}
              onSelectPart={setSel}
              height={560}
            />
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-3">
              Tip: click a wall or floor to open its material picker on the left.
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">No project.</Card>
      )}
    </RoleShell>
  );
}
