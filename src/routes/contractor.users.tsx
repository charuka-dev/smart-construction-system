import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { contractorNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/contractor/users")({
  head: () => ({ meta: [{ title: "User Management — BuildSync-3D" }] }),
  component: UserManagement,
});

function UserManagement() {
  const { users, setUserStatus, createSupervisor } = useApp();
  const clients = users.filter((u) => u.role === "client");
  const supervisors = users.filter((u) => u.role === "supervisor");

  const [form, setForm] = useState({ name: "", email: "", contactNo: "", password: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required.");
      return;
    }
    createSupervisor(form);
    setForm({ name: "", email: "", contactNo: "", password: "" });
    toast.success("Supervisor created.");
  };

  return (
    <RoleShell role="contractor" title="User management" nav={contractorNav}>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold mb-4">Clients</h2>
          <UserTable
            users={clients}
            onToggle={(u) => setUserStatus(u.id, u.status === "active" ? "inactive" : "active")}
          />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Supervisors</h2>
          </div>
          <UserTable
            users={supervisors}
            onToggle={(u) => setUserStatus(u.id, u.status === "active" ? "inactive" : "active")}
          />

          <form onSubmit={submit} className="mt-5 pt-5 border-t border-border space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Create supervisor account
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Contact no.</Label>
                <Input value={form.contactNo} onChange={(e) => setForm({ ...form, contactNo: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <Button type="submit">Create supervisor</Button>
          </form>
        </Card>
      </div>
    </RoleShell>
  );
}

function UserTable({
  users, onToggle,
}: {
  users: ReturnType<typeof useApp>["users"];
  onToggle: (u: ReturnType<typeof useApp>["users"][number]) => void;
}) {
  if (!users.length) return <div className="text-sm text-muted-foreground">None yet.</div>;
  return (
    <div className="divide-y divide-border">
      {users.map((u) => (
        <div key={u.id} className="py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium truncate">{u.name}</div>
            <div className="font-mono text-xs text-muted-foreground truncate">{u.email} · {u.contactNo}</div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${u.status === "active" ? "border-success/40 text-foreground bg-success/10" : "border-border text-muted-foreground"}`}>
              {u.status}
            </span>
            <Switch checked={u.status === "active"} onCheckedChange={() => onToggle(u)} />
          </div>
        </div>
      ))}
    </div>
  );
}
