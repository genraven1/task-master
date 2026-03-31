import client from './client';
import type { AuthRequest, AuthResponse } from '../types';

export const authApi = {
  login: async (data: AuthRequest): Promise<AuthResponse> => {
    return client.post<AuthResponse>('/auth/login', data);
  },

  register: async (data: AuthRequest & { email: string }): Promise<AuthResponse> => {
    return client.post<AuthResponse>('/auth/register', data);
  },
};
