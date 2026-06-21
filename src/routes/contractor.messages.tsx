import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { contractorNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/contractor/messages")({
  head: () => ({ meta: [{ title: "Communication — BuildSync-3D" }] }),
  component: Messages,
});

function Messages() {
  const { projects, users, messages, currentUser, addMessage } = useApp();
  const [pid, setPid] = useState(projects[0]?.id ?? "");
  const project = projects.find((p) => p.id === pid);
  const [draft, setDraft] = useState("");
  const [target, setTarget] = useState<"client" | "supervisor">("client");

  const toId = project
    ? target === "client" ? project.clientId : project.supervisorId
    : null;

  const thread = useMemo(() => {
    if (!project || !toId || !currentUser) return [];
    return messages
      .filter((m) =>
        m.projectId === project.id &&
        ((m.fromUserId === currentUser.id && m.toUserId === toId) ||
         (m.fromUserId === toId && m.toUserId === currentUser.id)))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }, [messages, project, toId, currentUser]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !project || !toId || !currentUser) return;
    addMessage({ projectId: project.id, fromUserId: currentUser.id, toUserId: toId, content: draft.trim() });
    setDraft("");
  };

  return (
    <RoleShell role="contractor" title="Communication & notifications" nav={contractorNav}>
      <div className="flex items-end gap-3 mb-4 flex-wrap">
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select value={pid} onValueChange={setPid}>
            <SelectTrigger className="w-80"><SelectValue /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Conversation</Label>
          <Select value={target} onValueChange={(v) => setTarget(v as "client" | "supervisor")}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="client">With client</SelectItem>
              <SelectItem value="supervisor">With supervisor</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={toId ? "Write a message…" : "Assign a supervisor to enable this thread"} disabled={!toId} />
          <Button type="submit" disabled={!toId}>Send</Button>
        </form>
      </Card>
    </RoleShell>
  );
}
