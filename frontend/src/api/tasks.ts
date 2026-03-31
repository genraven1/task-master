import client from './client';
import type { Task, CreateTaskRequest, CompleteTaskResponse } from '../types';

export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    const response = await client.get<Task[]>('/tasks');
    return response.data;
  },

  getByType: async (type: string): Promise<Task[]> => {
    const response = await client.get<Task[]>(`/tasks?type=${type}`);
    return response.data;
  },

  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await client.post<Task>('/tasks', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateTaskRequest>): Promise<Task> => {
    const response = await client.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  complete: async (id: number): Promise<CompleteTaskResponse> => {
    const response = await client.post<CompleteTaskResponse>(`/tasks/${id}/complete`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/tasks/${id}`);
  },
};
