import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { user, status, logout, fetchUser } = useAuthStore();
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  
  return { user, status, isLoading, isAuthenticated, logout, fetchUser };
}
