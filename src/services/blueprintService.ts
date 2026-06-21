// Placeholder blueprint / 3D-model API service. Triggers the OpenCV
// pipeline on the backend.
import { api } from '@/lib/api';

export interface ModelDTO {
  rooms: Array<{ id: string; name?: string; polygon: number[][]; height: number }>;
  walls?: unknown[];
}

export const blueprintService = {
  uploadBlueprint: async (projectId: string, file: File) => {
    const form = new FormData();
    form.append('blueprint', file);
    return api.postForm<ModelDTO>(`/projects/${projectId}/blueprint`, form);
  },
  getModel: (projectId: string) => api.get<ModelDTO>(`/projects/${projectId}/model`),
};
