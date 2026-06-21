import { create } from 'zustand';
import { api } from '../lib/api';

interface MemberBalance {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  amount: number;
  currency: string;
}

interface NetSettlement {
  from: { userId: string; name: string };
  to: { userId: string; name: string };
  amount: number;
}

interface Settlement {
  id: string;
  payer_id: string;
  receiver_id: string;
  group_id: string;
  amount: number;
  currency: string;
  method: string;
  note: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  confirmed_at: string | null;
  created_at: string;
  payer?: { id: string; name: string; avatar_url: string | null };
  receiver?: { id: string; name: string; avatar_url: string | null };
}

interface GlobalBalance {
  totalOwed: number;
  totalOwedToMe: number;
  currency: string;
}

interface BalanceState {
  globalBalance: GlobalBalance;
  groupBalances: Record<string, MemberBalance[]>;
  netSettlements: Record<string, NetSettlement[]>;
  settlements: Record<string, Settlement[]>;
  isLoading: boolean;

  fetchGlobalBalance: () => Promise<void>;
  fetchGroupBalances: (groupId: string) => Promise<void>;
  fetchNetSettlement: (groupId: string) => Promise<void>;
  fetchSettlements: (groupId: string) => Promise<void>;
  createSettlement: (data: {
    receiverId: string;
    groupId: string;
    amount: number;
    currency?: string;
    method?: string;
    note?: string;
  }) => Promise<Settlement>;
  confirmSettlement: (settlementId: string) => Promise<void>;
  simulateCharge: (subscriptionId: string) => Promise<any>;
}

export const useBalanceStore = create<BalanceState>((set, get) => ({
  globalBalance: { totalOwed: 0, totalOwedToMe: 0, currency: 'INR' },
  groupBalances: {},
  netSettlements: {},
  settlements: {},
  isLoading: false,

  fetchGlobalBalance: async () => {
    try {
      const data = await api.get<GlobalBalance>('/api/balances/global');
      set({ globalBalance: data });
    } catch {}
  },

  fetchGroupBalances: async (groupId: string) => {
    try {
      const data = await api.get<{ balances: MemberBalance[] }>(`/api/groups/${groupId}/balances`);
      set(state => ({ groupBalances: { ...state.groupBalances, [groupId]: data.balances } }));
    } catch {}
  },

  fetchNetSettlement: async (groupId: string) => {
    try {
      const data = await api.get<{ settlements: NetSettlement[] }>(`/api/groups/${groupId}/net-settlement`);
      set(state => ({ netSettlements: { ...state.netSettlements, [groupId]: data.settlements } }));
    } catch {}
  },

  fetchSettlements: async (groupId: string) => {
    try {
      const data = await api.get<{ settlements: Settlement[] }>(`/api/groups/${groupId}/settlements`);
      set(state => ({ settlements: { ...state.settlements, [groupId]: data.settlements } }));
    } catch {}
  },

  createSettlement: async (data) => {
    const result = await api.post<{ settlement: Settlement }>('/api/settlements', data);
    await get().fetchGroupBalances(data.groupId);
    await get().fetchSettlements(data.groupId);
    return result.settlement;
  },

  confirmSettlement: async (settlementId: string) => {
    await api.post(`/api/settlements/${settlementId}/confirm`);
  },

  simulateCharge: async (subscriptionId: string) => {
    return await api.post(`/api/subscriptions/${subscriptionId}/simulate-charge`);
  },
}));
