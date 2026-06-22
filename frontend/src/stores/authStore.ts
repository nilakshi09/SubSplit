import { create } from 'zustand';
import { api, removeToken } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  gmailConnected: boolean;
  currency: string;
  onboardingStep: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

let fetchPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  fetchUser: async () => {
    if (fetchPromise) return fetchPromise;
    set({ isLoading: true });
    fetchPromise = (async () => {
      try {
        const user = await api.auth.me();
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        set({ user: null, isAuthenticated: false, isLoading: false });
      } finally {
        fetchPromise = null;
      }
    })();
    return fetchPromise;
  },

  logout: async () => {
    try { await api.auth.logout(); } catch {}
    removeToken();
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
