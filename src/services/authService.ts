// Placeholder auth API service. Wraps the backend /auth endpoints once
// VITE_USE_MOCK is false. Today the app still uses the mock store in
// src/lib/store.tsx; this file exists so feature work can move over
// incrementally without further restructuring.
import { api } from '@/lib/api';
import type { Role } from '@/lib/types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (payload: { email: string; password: string; name: string; role: Role }) =>
    api.post<AuthResponse>('/auth/register', payload),
  me: () => api.get<AuthUser>('/auth/me'),
};
