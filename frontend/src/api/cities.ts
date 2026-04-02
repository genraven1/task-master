import client from './client';
import type { City, Expedition, ExpeditionType, ExpeditionDuration } from '../types';

export const citiesApi = {
  getMyCity: async (): Promise<City> => {
    return client.get<City>('/cities/me');
  },

  getCity: async (id: number): Promise<City> => {
    return client.get<City>(`/cities/${id}`);
  },

  createCity: async (name: string): Promise<City> => {
    return client.post<City>('/cities', { name });
  },

  joinCity: async (inviteCode: string): Promise<City> => {
    return client.post<City>('/cities/join', { inviteCode });
  },

  leaveCity: async (): Promise<void> => {
    return client.delete('/cities/me');
  },

  getExpeditions: async (): Promise<Expedition[]> => {
    return client.get<Expedition[]>('/cities/me/expeditions');
  },

  launchExpedition: async (expeditionType: ExpeditionType, duration: ExpeditionDuration): Promise<Expedition> => {
    return client.post<Expedition>('/cities/me/expeditions', { expeditionType, duration });
  },

  claimExpedition: async (expeditionId: number): Promise<Expedition> => {
    return client.post<Expedition>(`/cities/me/expeditions/${expeditionId}/claim`, {});
  },
};
