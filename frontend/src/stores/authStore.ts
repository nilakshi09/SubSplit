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

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

let fetchPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'loading',

  fetchUser: async () => {
    // If already authenticated, or a fetch is currently running, don't revert to loading
    if (fetchPromise) return fetchPromise;
    
    // Only set loading if we are truly uninitialized
    if (get().status === 'unauthenticated' || get().status === 'loading') {
      if (get().status !== 'loading') {
        set({ status: 'loading' });
      }
    }

    fetchPromise = (async () => {
      try {
        const user = await api.auth.me();
        set({ user, status: 'authenticated' });
      } catch {
        set({ user: null, status: 'unauthenticated' });
      } finally {
        fetchPromise = null;
      }
    })();
    return fetchPromise;
  },

  logout: async () => {
    try { await api.auth.logout(); } catch {}
    removeToken();
    set({ user: null, status: 'unauthenticated' });
    window.location.href = '/login';
  },

  setUser: (user) => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),
}));
