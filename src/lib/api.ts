// Thin fetch wrapper for the BuildSync-3D backend.
// Set VITE_API_BASE_URL and VITE_USE_MOCK in .env to switch from the
// in-memory mock store to the real Node/Express API.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true") === "true";

const TOKEN_KEY = "buildsync3d.token";

export const auth = {
  getToken: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = auth.getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Generic verbs used by the placeholder service modules in src/services/.
// They sit alongside the named helpers below.
export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: "POST", body: form }),
};

export const api = {
  ...http,
  // auth
  login: (email: string, password: string) =>
    request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: { email: string; password: string; name: string; role: string }) =>
    request<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: () => request<any>("/auth/me"),

  // users
  listUsers: () => request<any[]>("/users"),
  createUser: (p: any) => request<any>("/users", { method: "POST", body: JSON.stringify(p) }),
  updateUser: (id: number, p: any) =>
    request<any>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(p) }),
  deleteUser: (id: number) => request<any>(`/users/${id}`, { method: "DELETE" }),

  // projects
  listProjects: () => request<any[]>("/projects"),
  getProject: (id: number) => request<any>(`/projects/${id}`),
  createProject: (p: any) => request<any>("/projects", { method: "POST", body: JSON.stringify(p) }),
  updateProject: (id: number, p: any) =>
    request<any>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(p) }),
  deleteProject: (id: number) => request<any>(`/projects/${id}`, { method: "DELETE" }),

  // milestones / expenses / progress / messages / model
  listMilestones: (pid: number) => request<any[]>(`/projects/${pid}/milestones`),
  createMilestone: (pid: number, p: any) =>
    request<any>(`/projects/${pid}/milestones`, { method: "POST", body: JSON.stringify(p) }),
  updateMilestone: (pid: number, mid: number, p: any) =>
    request<any>(`/projects/${pid}/milestones/${mid}`, { method: "PATCH", body: JSON.stringify(p) }),

  listExpenses: (pid: number) =>
    request<{ items: any[]; total: number }>(`/projects/${pid}/expenses`),
  createExpense: (pid: number, p: any) =>
    request<any>(`/projects/${pid}/expenses`, { method: "POST", body: JSON.stringify(p) }),

  listProgress: (pid: number) => request<any[]>(`/projects/${pid}/progress`),
  createProgress: (pid: number, form: FormData) =>
    request<any>(`/projects/${pid}/progress`, { method: "POST", body: form }),

  listMessages: (pid: number) => request<any[]>(`/projects/${pid}/messages`),
  sendMessage: (pid: number, body: string) =>
    request<any>(`/projects/${pid}/messages`, { method: "POST", body: JSON.stringify({ body }) }),

  getModel: (pid: number) =>
    request<{ rooms: { id: string; polygon: number[][]; height: number; name?: string }[] }>(
      `/projects/${pid}/model`,
    ),
  uploadBlueprint: (pid: number, file: File) => {
    const fd = new FormData();
    fd.append("blueprint", file);
    return request<any>(`/projects/${pid}/blueprint`, { method: "POST", body: fd });
  },
};
