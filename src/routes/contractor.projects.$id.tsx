import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { contractorNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scene3D } from "@/components/Scene3D";
import { ProjectStatusBadge, fmtMoney } from "@/components/ui-bits";
import { toast } from "sonner";

export const Route = createFileRoute("/contractor/projects/$id")({
  head: () => ({ meta: [{ title: "Project — BuildSync-3D" }] }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const { projects, users, updateProject, assignSupervisor, addMilestone } = useApp();
  const project = projects.find((p) => p.id === id);
  const supervisors = users.filter((u) => u.role === "supervisor");

  const [showBlueprint, setShowBlueprint] = useState(false);
  const [ms, setMs] = useState({ title: "", dueDate: "" });

  if (!project) {
    return (
      <RoleShell role="contractor" title="Project" nav={contractorNav}>
        <Card className="p-6">Project not found. <Link to="/contractor/projects" className="text-primary underline">Back</Link></Card>
      </RoleShell>
    );
  }

  return (
    <RoleShell role="contractor" title={project.name} nav={contractorNav}>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {showBlueprint ? "Original blueprint" : "Generated 3D model"}
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowBlueprint((s) => !s)}>
                {showBlueprint ? "Show 3D" : "Show blueprint"}
              </Button>
            </div>
            {showBlueprint ? (
              <img src={project.blueprintImageUrl} alt="Blueprint" className="w-full rounded-lg border border-border" />
            ) : (
              <Scene3D rooms={project.rooms} height={420} />
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-semibold mb-3">Milestones</h3>
            <div className="divide-y divide-border">
              {project.milestones.length === 0 && (
                <div className="text-sm text-muted-foreground py-2">No milestones yet.</div>
              )}
              {project.milestones.map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{m.title}</div>
                    <div className="font-mono text-xs text-muted-foreground">Due {m.dueDate}</div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{m.status}</span>
                </div>
              ))}
            </div>
            <form
              className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2 items-end"
              onSubmit={(e) => {
                e.preventDefault();
                if (!ms.title || !ms.dueDate) return;
                addMilestone(project.id, { title: ms.title, dueDate: ms.dueDate, status: "pending" });
                setMs({ title: "", dueDate: "" });
                toast.success("Milestone added.");
              }}
            >
              <div className="flex-1 min-w-[180px] space-y-1.5">
                <Label>Title</Label>
                <Input value={ms.title} onChange={(e) => setMs({ ...ms, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Due date</Label>
                <Input type="date" value={ms.dueDate} onChange={(e) => setMs({ ...ms, dueDate: e.target.value })} />
              </div>
              <Button type="submit">Add</Button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold">Details</h3>
              <ProjectStatusBadge status={project.status} />
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input defaultValue={project.name} onBlur={(e) => updateProject(project.id, { name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Estimated cost</Label>
                  <Input type="number" defaultValue={project.estimatedCost} onBlur={(e) => updateProject(project.id, { estimatedCost: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Budget</Label>
                  <Input type="number" defaultValue={project.budget} onBlur={(e) => updateProject(project.id, { budget: Number(e.target.value) })} />
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Estimated {fmtMoney(project.estimatedCost)} · Budget {fmtMoney(project.budget)}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-semibold mb-3">Assign supervisor</h3>
            <Select
              value={project.supervisorId ?? ""}
              onValueChange={(v) => { assignSupervisor(project.id, v); toast.success("Supervisor assigned."); }}
            >
              <SelectTrigger><SelectValue placeholder="Choose supervisor" /></SelectTrigger>
              <SelectContent>
                {supervisors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Card>
        </div>
      </div>
    </RoleShell>
  );
}
