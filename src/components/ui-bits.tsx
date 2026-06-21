import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectStatus, RoomStatus } from "@/lib/types";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  in_progress: "In progress",
  completed: "Completed",
};

const STATUS_TONE: Record<ProjectStatus, string> = {
  pending: "bg-warning/15 text-foreground border-warning/40",
  approved: "bg-blueprint/15 text-foreground border-blueprint/40",
  rejected: "bg-destructive/15 text-destructive border-destructive/40",
  in_progress: "bg-primary/15 text-foreground border-primary/40",
  completed: "bg-success/15 text-foreground border-success/40",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-mono uppercase tracking-wider ${STATUS_TONE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

const ROOM_TONE: Record<RoomStatus, string> = {
  not_started: "bg-destructive/15 text-destructive border-destructive/40",
  in_progress: "bg-warning/20 text-foreground border-warning/40",
  done: "bg-success/15 text-foreground border-success/40",
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const label = status === "not_started" ? "Not started" : status === "in_progress" ? "In progress" : "Done";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-mono uppercase tracking-wider ${ROOM_TONE[status]}`}>
      {label}
    </span>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </Card>
  );
}

export const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
