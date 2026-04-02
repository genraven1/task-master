import client from './client';
import type { Task, CreateTaskRequest, CompleteTaskResponse } from '../types';

export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    return client.get<Task[]>('/tasks');
  },

  getByType: async (type: string): Promise<Task[]> => {
    return client.get<Task[]>(`/tasks?type=${type}`);
  },

  create: async (data: CreateTaskRequest): Promise<Task> => {
    return client.post<Task>('/tasks', data);
  },

  update: async (id: number, data: Partial<CreateTaskRequest>): Promise<Task> => {
    return client.put<Task>(`/tasks/${id}`, data);
  },

  complete: async (id: number): Promise<CompleteTaskResponse> => {
    return client.post<CompleteTaskResponse>(`/tasks/${id}/complete`);
  },

  delete: async (id: number): Promise<void> => {
    return client.delete(`/tasks/${id}`);
  },
};
