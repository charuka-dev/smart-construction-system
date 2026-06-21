// Placeholder daily-progress API service.
import { api } from '@/lib/api';

export interface ProgressEntryDTO {
  id: string;
  project_id: string;
  date: string;
  percent_complete: number;
  notes?: string;
  photo_urls: string[];
}

export const progressService = {
  listForProject: (projectId: string) =>
    api.get<ProgressEntryDTO[]>(`/progress?project_id=${encodeURIComponent(projectId)}`),
  create: (payload: Partial<ProgressEntryDTO>) =>
    api.post<ProgressEntryDTO>('/progress', payload),
};
