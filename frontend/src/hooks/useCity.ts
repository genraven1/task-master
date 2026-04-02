import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citiesApi } from '../api/cities';
import type { ExpeditionType, ExpeditionDuration } from '../types';

export const useMyCity = () => {
  return useQuery({
    queryKey: ['city'],
    queryFn: citiesApi.getMyCity,
    staleTime: 30_000,
    retry: false, // 404 = not in a city – don't spam retries
    refetchOnWindowFocus: false, // city changes only via explicit mutations
  });
};

export const useCreateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => citiesApi.createCity(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['city'] });
    },
  });
};

export const useJoinCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) => citiesApi.joinCity(inviteCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['city'] });
    },
  });
};

export const useLeaveCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: citiesApi.leaveCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['city'] });
    },
  });
};

export const useLaunchExpedition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expeditionType, duration }: { expeditionType: ExpeditionType; duration: ExpeditionDuration }) =>
      citiesApi.launchExpedition(expeditionType, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['city'] });
    },
  });
};

export const useClaimExpedition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expeditionId: number) => citiesApi.claimExpedition(expeditionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['city'] });
    },
  });
};
