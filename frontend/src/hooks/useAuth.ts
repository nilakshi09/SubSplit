import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { user, isLoading, isAuthenticated, logout, fetchUser } = useAuthStore();
  return { user, isLoading, isAuthenticated, logout, fetchUser };
}
