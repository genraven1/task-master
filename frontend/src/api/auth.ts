import client from './client';
import type { AuthRequest, AuthResponse } from '../types';

export const authApi = {
  login: async (data: AuthRequest): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: AuthRequest & { email: string }): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};
