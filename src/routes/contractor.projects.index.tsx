import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { contractorNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge, fmtMoney } from "@/components/ui-bits";
import { toast } from "sonner";

export const Route = createFileRoute("/contractor/projects/")({
  head: () => ({ meta: [{ title: "Projects — BuildSync-3D" }] }),
  component: Projects,
});

function Projects() {
  const { projects, users, updateProject } = useApp();
  return (
    <RoleShell role="contractor" title="Project management" nav={contractorNav}>
      <div className="grid gap-4">
        {projects.map((p) => {
          const client = users.find((u) => u.id === p.clientId);
          return (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                    <ProjectStatusBadge status={p.status} />
                  </div>
                  <div className="font-mono text-xs text-muted-foreground mt-1">
                    Client: {client?.name ?? "?"} · Estimated {fmtMoney(p.estimatedCost)} · Budget {fmtMoney(p.budget)}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {p.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => { updateProject(p.id, { status: "approved" }); toast.success("Approved."); }}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { updateProject(p.id, { status: "rejected" }); toast("Rejected."); }}>
                        Reject
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="secondary" asChild>
                    <Link to="/contractor/projects/$id" params={{ id: p.id }}>Open</Link>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </RoleShell>
  );
}
