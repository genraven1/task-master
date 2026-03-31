import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { useAuthStore } from '../store/authStore';

export const useUser = () => {
  const { isAuthenticated, updateUser } = useAuthStore();

  const query = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const user = await usersApi.getMe();
      updateUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  return query;
};
