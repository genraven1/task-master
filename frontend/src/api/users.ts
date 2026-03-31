import client from './client';
import type { User } from '../types';

export const usersApi = {
  getMe: async (): Promise<User> => {
    return client.get<User>('/users/me');
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return client.put<User>('/users/me', data);
  },
};
