// Placeholder project API service. See authService for context.
import { api } from '@/lib/api';

export interface ProjectDTO {
  id: string;
  name: string;
  client_id: string;
  supervisor_id?: string | null;
  status: string;
  created_at: string;
}

export const projectService = {
  list: () => api.get<ProjectDTO[]>('/projects'),
  get: (id: string) => api.get<ProjectDTO>(`/projects/${id}`),
  create: (payload: Partial<ProjectDTO>) => api.post<ProjectDTO>('/projects', payload),
  update: (id: string, payload: Partial<ProjectDTO>) =>
    api.patch<ProjectDTO>(`/projects/${id}`, payload),
  remove: (id: string) => api.delete<void>(`/projects/${id}`),
};
