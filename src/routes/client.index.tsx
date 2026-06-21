import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { clientNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge, fmtMoney } from "@/components/ui-bits";

export const Route = createFileRoute("/client/")({
  head: () => ({ meta: [{ title: "My Projects — BuildSync-3D" }] }),
  component: ClientHome,
});

function ClientHome() {
  const { projects, currentUser } = useApp();
  const mine = projects.filter((p) => p.clientId === currentUser?.id);
  return (
    <RoleShell role="client" title="My projects" nav={clientNav}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Track every project you've submitted with BuildSync-3D.</p>
        <Button asChild><Link to="/client/new">New project</Link></Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {mine.length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground">
            No projects yet. <Link className="text-primary underline" to="/client/new">Create your first one</Link>.
          </Card>
        )}
        {mine.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <ProjectStatusBadge status={p.status} />
            </div>
            <h3 className="font-display text-lg font-semibold mt-1">{p.name}</h3>
            <div className="font-mono text-xs text-muted-foreground mt-1">
              Estimated {fmtMoney(p.estimatedCost)} · {p.rooms.length} rooms
            </div>
            <img src={p.blueprintImageUrl} alt="" className="mt-3 rounded-md border border-border aspect-[3/2] object-cover" />
          </Card>
        ))}
      </div>
    </RoleShell>
  );
}
