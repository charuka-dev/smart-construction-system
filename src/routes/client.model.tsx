import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { clientNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scene3D } from "@/components/Scene3D";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/client/model")({
  head: () => ({ meta: [{ title: "3D Model — BuildSync-3D" }] }),
  component: ModelView,
});

function ModelView() {
  const { projects, currentUser } = useApp();
  const mine = projects.filter((p) => p.clientId === currentUser?.id);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const [showBoth, setShowBoth] = useState(true);
  const project = mine.find((p) => p.id === pid);

  return (
    <RoleShell role="client" title="View 3D model" nav={clientNav}>
      <div className="flex items-end gap-3 mb-4 flex-wrap">
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select value={pid} onValueChange={setPid}>
            <SelectTrigger className="w-80"><SelectValue /></SelectTrigger>
            <SelectContent>
              {mine.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => setShowBoth((s) => !s)}>
          {showBoth ? "Hide blueprint" : "Show blueprint side-by-side"}
        </Button>
      </div>

      {project ? (
        <div className={`grid gap-4 ${showBoth ? "lg:grid-cols-2" : ""}`}>
          <Card className="p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">3D model</div>
            <Scene3D rooms={project.rooms} height={520} />
          </Card>
          {showBoth && (
            <Card className="p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Original blueprint</div>
              <img src={project.blueprintImageUrl} alt="Blueprint" className="w-full h-[520px] rounded-md border border-border object-contain bg-muted/40" />
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">No project.</Card>
      )}
    </RoleShell>
  );
}
