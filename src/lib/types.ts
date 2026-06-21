export type Role = "client" | "contractor" | "supervisor";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  status: "active" | "inactive";
  contactNo: string;
  currentAddress?: string;
  siteAddress?: string;
}

export type ProjectStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed";

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  status: "pending" | "in_progress" | "done";
}

export type RoomStatus = "not_started" | "in_progress" | "done";

export interface Room {
  id: string;
  name: string;
  /** polygon points in meters, world XZ plane */
  polygon: [number, number][];
  areaM2: number;
  status: RoomStatus;
  wallColor: string; // hex
  tileStyle:
    | "marble_white"
    | "wood_oak"
    | "slate_grey"
    | "ceramic_blue"
    | "terracotta";
  cupboardStyle: "oak" | "walnut" | "white_matte" | "none";
}

export interface ProgressLog {
  id: string;
  projectId: string;
  roomId: string;
  note: string;
  photoUrl?: string;
  status: RoomStatus;
  date: string; // ISO yyyy-mm-dd
  loggedBy: string;
}

export type ExpenseCategory = "materials" | "labor" | "equipment" | "other";

export interface Expense {
  id: string;
  projectId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
}

export interface QualityInspection {
  id: string;
  projectId: string;
  roomId: string;
  status: "ok" | "issue";
  notes: string;
  date: string;
  supervisorId: string;
}

export interface SafetyIssue {
  id: string;
  projectId: string;
  date: string;
  description: string;
  reasonWorkStopped: string;
  resolved: boolean;
}

export interface Message {
  id: string;
  projectId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  supervisorId: string | null;
  status: ProjectStatus;
  estimatedCost: number;
  budget: number;
  blueprintImageUrl: string;
  rooms: Room[];
  createdAt: string;
  milestones: Milestone[];
}
