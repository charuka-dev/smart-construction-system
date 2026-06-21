import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  seedExpenses,
  seedMessages,
  seedProgress,
  seedProjects,
  seedQuality,
  seedSafety,
  seedUsers,
} from "./mock-data";
import type {
  Expense,
  Message,
  Milestone,
  Project,
  ProgressLog,
  QualityInspection,
  Role,
  Room,
  SafetyIssue,
  User,
} from "./types";

interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  expenses: Expense[];
  progress: ProgressLog[];
  quality: QualityInspection[];
  safety: SafetyIssue[];
  messages: Message[];

  login: (email: string, password: string) => User | null;
  loginAs: (role: Role) => void;
  logout: () => void;
  registerClient: (data: Omit<User, "id" | "role" | "status">) => User;

  createSupervisor: (data: Omit<User, "id" | "role" | "status">) => User;
  setUserStatus: (id: string, status: "active" | "inactive") => void;

  createProject: (
    data: Pick<Project, "name" | "estimatedCost" | "blueprintImageUrl"> & { clientId: string },
  ) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  assignSupervisor: (projectId: string, supervisorId: string) => void;
  addMilestone: (projectId: string, m: Omit<Milestone, "id" | "projectId">) => void;
  updateRoom: (projectId: string, roomId: string, patch: Partial<Room>) => void;

  addExpense: (e: Omit<Expense, "id">) => void;
  addProgress: (p: Omit<ProgressLog, "id">) => void;
  addQuality: (q: Omit<QualityInspection, "id">) => void;
  addSafety: (s: Omit<SafetyIssue, "id">) => void;
  toggleSafetyResolved: (id: string) => void;
  addMessage: (m: Omit<Message, "id" | "timestamp">) => void;
}

const AppContext = createContext<AppState | null>(null);

const id = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [progress, setProgress] = useState<ProgressLog[]>(seedProgress);
  const [quality, setQuality] = useState<QualityInspection[]>(seedQuality);
  const [safety, setSafety] = useState<SafetyIssue[]>(seedSafety);
  const [messages, setMessages] = useState<Message[]>(seedMessages);

  const login = useCallback(
    (email: string, password: string) => {
      const u = users.find(
        (x) =>
          x.email.toLowerCase() === email.toLowerCase() &&
          x.password === password &&
          x.status === "active",
      );
      if (u) setCurrentUser(u);
      return u ?? null;
    },
    [users],
  );

  const loginAs = useCallback(
    (role: Role) => {
      const u = users.find((x) => x.role === role && x.status === "active");
      if (u) setCurrentUser(u);
    },
    [users],
  );

  const logout = useCallback(() => setCurrentUser(null), []);

  const registerClient: AppState["registerClient"] = useCallback((data) => {
    const u: User = {
      ...data,
      id: id("u"),
      role: "client",
      status: "active",
    };
    setUsers((prev) => [...prev, u]);
    setCurrentUser(u);
    return u;
  }, []);

  const createSupervisor: AppState["createSupervisor"] = useCallback((data) => {
    const u: User = {
      ...data,
      id: id("u"),
      role: "supervisor",
      status: "active",
    };
    setUsers((prev) => [...prev, u]);
    return u;
  }, []);

  const setUserStatus: AppState["setUserStatus"] = useCallback((uid, status) => {
    setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, status } : u)));
  }, []);

  const createProject: AppState["createProject"] = useCallback((data) => {
    const p: Project = {
      id: id("p"),
      name: data.name,
      clientId: data.clientId,
      supervisorId: null,
      status: "pending",
      estimatedCost: data.estimatedCost,
      budget: 0,
      blueprintImageUrl: data.blueprintImageUrl,
      createdAt: new Date().toISOString().slice(0, 10),
      milestones: [],
      rooms: [
        {
          id: id("r"),
          name: "Main Room",
          polygon: [[0, 0], [6, 0], [6, 5], [0, 5]],
          areaM2: 30,
          status: "not_started",
          wallColor: "#e8dfd1",
          tileStyle: "wood_oak",
          cupboardStyle: "oak",
        },
        {
          id: id("r"),
          name: "Bedroom",
          polygon: [[6, 0], [10, 0], [10, 5], [6, 5]],
          areaM2: 20,
          status: "not_started",
          wallColor: "#d8d2c2",
          tileStyle: "ceramic_blue",
          cupboardStyle: "walnut",
        },
        {
          id: id("r"),
          name: "Bathroom",
          polygon: [[0, 5], [4, 5], [4, 8], [0, 8]],
          areaM2: 12,
          status: "not_started",
          wallColor: "#dfe7ea",
          tileStyle: "slate_grey",
          cupboardStyle: "none",
        },
      ],
    };
    setProjects((prev) => [p, ...prev]);
    return p;
  }, []);

  const updateProject: AppState["updateProject"] = useCallback((pid, patch) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === pid ? { ...p, ...patch } : p)),
    );
  }, []);

  const assignSupervisor: AppState["assignSupervisor"] = useCallback(
    (pid, sid) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === pid ? { ...p, supervisorId: sid } : p)),
      );
    },
    [],
  );

  const addMilestone: AppState["addMilestone"] = useCallback((pid, m) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === pid
          ? {
              ...p,
              milestones: [
                ...p.milestones,
                { ...m, id: id("m"), projectId: pid },
              ],
            }
          : p,
      ),
    );
  }, []);

  const updateRoom: AppState["updateRoom"] = useCallback(
    (pid, rid, patch) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === pid
            ? {
                ...p,
                rooms: p.rooms.map((r) => (r.id === rid ? { ...r, ...patch } : r)),
              }
            : p,
        ),
      );
    },
    [],
  );

  const addExpense: AppState["addExpense"] = useCallback((e) => {
    setExpenses((prev) => [{ ...e, id: id("e") }, ...prev]);
  }, []);
  const addProgress: AppState["addProgress"] = useCallback((p) => {
    setProgress((prev) => [{ ...p, id: id("pl") }, ...prev]);
  }, []);
  const addQuality: AppState["addQuality"] = useCallback((q) => {
    setQuality((prev) => [{ ...q, id: id("q") }, ...prev]);
  }, []);
  const addSafety: AppState["addSafety"] = useCallback((s) => {
    setSafety((prev) => [{ ...s, id: id("s") }, ...prev]);
  }, []);
  const toggleSafetyResolved: AppState["toggleSafetyResolved"] = useCallback(
    (sid) => {
      setSafety((prev) =>
        prev.map((s) => (s.id === sid ? { ...s, resolved: !s.resolved } : s)),
      );
    },
    [],
  );
  const addMessage: AppState["addMessage"] = useCallback((m) => {
    setMessages((prev) => [
      ...prev,
      { ...m, id: id("msg"), timestamp: new Date().toISOString() },
    ]);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      currentUser,
      users,
      projects,
      expenses,
      progress,
      quality,
      safety,
      messages,
      login,
      loginAs,
      logout,
      registerClient,
      createSupervisor,
      setUserStatus,
      createProject,
      updateProject,
      assignSupervisor,
      addMilestone,
      updateRoom,
      addExpense,
      addProgress,
      addQuality,
      addSafety,
      toggleSafetyResolved,
      addMessage,
    }),
    [
      currentUser, users, projects, expenses, progress, quality, safety, messages,
      login, loginAs, logout, registerClient, createSupervisor, setUserStatus,
      createProject, updateProject, assignSupervisor, addMilestone, updateRoom,
      addExpense, addProgress, addQuality, addSafety, toggleSafetyResolved, addMessage,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
