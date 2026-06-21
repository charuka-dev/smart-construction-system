// Placeholder budget / expenses API service.
import { api } from '@/lib/api';

export interface ExpenseDTO {
  id: string;
  project_id: string;
  category: string;
  amount: number;
  note?: string;
  created_at: string;
}

export const budgetService = {
  listForProject: (projectId: string) =>
    api.get<ExpenseDTO[]>(`/expenses?project_id=${encodeURIComponent(projectId)}`),
  create: (payload: Partial<ExpenseDTO>) => api.post<ExpenseDTO>('/expenses', payload),
  remove: (id: string) => api.delete<void>(`/expenses/${id}`),
};
