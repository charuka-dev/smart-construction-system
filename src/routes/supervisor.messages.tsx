import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { supervisorNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/supervisor/messages")({
  head: () => ({ meta: [{ title: "Contractor Chat — BuildSync-3D" }] }),
  component: SupMessages,
});

function SupMessages() {
  const { projects, users, messages, currentUser, addMessage } = useApp();
  const mine = projects.filter((p) => p.supervisorId === currentUser?.id);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const project = mine.find((p) => p.id === pid);
  const contractor = users.find((u) => u.role === "contractor");
  const [draft, setDraft] = useState("");

  const thread = useMemo(() => {
    if (!project || !contractor || !currentUser) return [];
    return messages
      .filter((m) =>
        m.projectId === project.id &&
        ((m.fromUserId === currentUser.id && m.toUserId === contractor.id) ||
         (m.fromUserId === contractor.id && m.toUserId === currentUser.id)))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }, [messages, project, contractor, currentUser]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !project || !contractor || !currentUser) return;
    addMessage({ projectId: project.id, fromUserId: currentUser.id, toUserId: contractor.id, content: draft.trim() });
    setDraft("");
  };

  return (
    <RoleShell role="supervisor" title="Communicate with contractor" nav={supervisorNav}>
      <div className="mb-4 max-w-md space-y-1.5">
        <Label>Project</Label>
        <Select value={pid} onValueChange={setPid}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {mine.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-5 flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {thread.length === 0 && <div className="text-sm text-muted-foreground">No messages yet.</div>}
          {thread.map((m) => {
            const mine = m.fromUserId === currentUser?.id;
            const author = users.find((u) => u.id === m.fromUserId);
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-lg px-3 py-2 ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <div className="font-mono text-[10px] uppercase tracking-wider opacity-70 mb-0.5">{author?.name}</div>
                  <div className="text-sm">{m.content}</div>
                </div>
              </div>
            );
          })}
        </div>
        <form className="mt-4 flex gap-2" onSubmit={send}>
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message the contractor…" />
          <Button type="submit">Send</Button>
        </form>
      </Card>
    </RoleShell>
  );
}
