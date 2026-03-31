import client from './client';
import type { User } from '../types';

export const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await client.get<User>('/users/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await client.put<User>('/users/me', data);
    return response.data;
  },
};
