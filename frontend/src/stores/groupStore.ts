import { create } from 'zustand';
import { api } from '../lib/api';

export interface GroupMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  inviteCode: string;
  createdBy: string;
  memberCount?: number;
  subscriptionCount?: number;
  createdAt: string;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
  subscriptions: any[];
}

interface GroupState {
  groups: Group[];
  currentGroup: GroupDetail | null;
  isLoading: boolean;
  fetchGroups: () => Promise<void>;
  fetchGroup: (id: string) => Promise<void>;
  createGroup: (data: { name: string; description?: string; emoji?: string }) => Promise<Group>;
  deleteGroup: (id: string) => Promise<void>;
  generateInvite: (id: string) => Promise<{ inviteCode: string; inviteUrl: string }>;
  joinGroup: (code: string) => Promise<{ group: Group; message: string }>;
  leaveGroup: (id: string) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  currentGroup: null,
  isLoading: false,

  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const data = await api.get<{ groups: Group[] }>('/api/groups');
      set({ groups: data.groups, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchGroup: async (id: string) => {
    set({ isLoading: true });
    try {
      const data = await api.get<{ group: Group; members: GroupMember[]; subscriptions: any[] }>(`/api/groups/${id}`);
      set({
        currentGroup: { ...data.group, members: data.members, subscriptions: data.subscriptions },
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  createGroup: async (groupData) => {
    const data = await api.post<{ group: Group }>('/api/groups', groupData);
    await get().fetchGroups();
    return data.group;
  },

  deleteGroup: async (id: string) => {
    await api.delete(`/api/groups/${id}`);
    set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }));
  },

  generateInvite: async (id: string) => {
    return await api.post<{ inviteCode: string; inviteUrl: string }>(`/api/groups/${id}/invite`);
  },

  joinGroup: async (code: string) => {
    return await api.post<{ group: Group; message: string }>(`/api/groups/join/${code}`);
  },

  leaveGroup: async (id: string) => {
    await api.post(`/api/groups/${id}/leave`);
    set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }));
  },

  removeMember: async (groupId: string, userId: string) => {
    await api.delete(`/api/groups/${groupId}/members/${userId}`);
    await get().fetchGroup(groupId);
  },
}));
