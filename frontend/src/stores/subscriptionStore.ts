import { create } from 'zustand';
import { api } from '../lib/api';

export interface Subscription {
  id: string;
  service_name: string;
  service_icon: string;
  amount: number;
  currency: string;
  frequency: string;
  status: 'pending' | 'active' | 'archived' | 'cancelled';
  confidence: number;
  last_charged_at: string | null;
  next_expected: string | null;
  charge_count: number;
  created_at: string;
}

interface SubscriptionState {
  subscriptions: Subscription[];
  pending: Subscription[];
  isLoading: boolean;
  isScanning: boolean;
  fetchSubscriptions: () => Promise<void>;
  fetchPending: () => Promise<void>;
  scanInbox: () => Promise<{ detected: number; totalProcessed: number }>;
  confirmSubscription: (id: string) => Promise<void>;
  dismissSubscription: (id: string) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  pending: [],
  isLoading: false,
  isScanning: false,

  fetchSubscriptions: async () => {
    set({ isLoading: true });
    try {
      const data = await api.get<{ subscriptions: Subscription[] }>('/api/subscriptions');
      set({ subscriptions: data.subscriptions, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchPending: async () => {
    try {
      const data = await api.get<{ pending: Subscription[] }>('/api/subscriptions/pending');
      set({ pending: data.pending });
    } catch {
      // Silently fail — the UI will just show no pending items
    }
  },

  scanInbox: async () => {
    set({ isScanning: true });
    try {
      const data = await api.post<{ detected: number; totalProcessed: number }>(
        '/api/subscriptions/scan'
      );
      await get().fetchPending();
      await get().fetchSubscriptions();
      set({ isScanning: false });
      return data;
    } catch {
      set({ isScanning: false });
      throw new Error('Scan failed');
    }
  },

  confirmSubscription: async (id: string) => {
    await api.post(`/api/subscriptions/${id}/confirm`);
    await get().fetchPending();
    await get().fetchSubscriptions();
  },

  dismissSubscription: async (id: string) => {
    await api.delete(`/api/subscriptions/${id}`);
    set((state) => ({ pending: state.pending.filter((p) => p.id !== id) }));
  },
}));
