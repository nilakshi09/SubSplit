import crypto from 'crypto';
import { supabaseAdmin } from '../../utils/supabase.js';

/**
 * Generate an 8-character alphanumeric invite code.
 */
export function generateInviteCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Check if a user has the 'admin' role in a group.
 */
export async function isGroupAdmin(groupId: string, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();

  return !!data;
}

/**
 * Check if a user is a member (any role) of a group.
 */
export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  return !!data;
}

/**
 * Fetch a group along with its members (with user details) and assigned subscriptions.
 * Returns null if the requesting user is not a member.
 */
export async function getGroupWithMembers(groupId: string, userId: string) {
  // Verify user is a member
  const isMember = await isGroupMember(groupId, userId);
  if (!isMember) return null;

  // Fetch the group
  const { data: group, error: groupError } = await supabaseAdmin
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (groupError || !group) return null;

  // Fetch members with user details
  const { data: memberRows, error: membersError } = await supabaseAdmin
    .from('group_members')
    .select('id, user_id, role, joined_at, users(id, name, email, avatar_url)')
    .eq('group_id', groupId);

  if (membersError) throw membersError;

  const members = (memberRows || []).map((m: any) => ({
    id: m.id,
    userId: m.user_id,
    name: m.users?.name || null,
    email: m.users?.email || null,
    avatarUrl: m.users?.avatar_url || null,
    role: m.role,
    joinedAt: m.joined_at,
  }));

  // Fetch subscriptions assigned to this group
  const { data: subscriptions, error: subsError } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('group_id', groupId);

  if (subsError) throw subsError;

  return { group, members, subscriptions: subscriptions || [] };
}

/**
 * Calculate the split amounts for each member given a total and split configuration.
 */
export async function calculateSplit(
  totalAmount: number,
  splitType: 'equal' | 'percentage' | 'fixed',
  ownerId: string,
  members: { userId: string; value: number; isExcluded: boolean }[],
): Promise<{ userId: string; amount: number; percentage?: number }[]> {
  // Filter out excluded members and the owner
  const activeMembers = members.filter((m) => !m.isExcluded && m.userId !== ownerId);

  if (activeMembers.length === 0) return [];

  const results: { userId: string; amount: number; percentage?: number }[] = [];

  switch (splitType) {
    case 'equal': {
      // Divide among active members + owner
      const splitCount = activeMembers.length + 1;
      const share = Math.floor((totalAmount / splitCount) * 100) / 100; // round down to 2 decimals
      const totalDistributed = share * activeMembers.length;
      const remainder = Math.round((totalAmount - share - totalDistributed) * 100) / 100;

      activeMembers.forEach((m, index) => {
        const amount = index === 0 ? Math.round((share + remainder) * 100) / 100 : share;
        results.push({
          userId: m.userId,
          amount,
          percentage: Math.round((100 / splitCount) * 100) / 100,
        });
      });
      break;
    }

    case 'percentage': {
      activeMembers.forEach((m) => {
        results.push({
          userId: m.userId,
          amount: Math.round((totalAmount * m.value / 100) * 100) / 100,
          percentage: m.value,
        });
      });
      break;
    }

    case 'fixed': {
      activeMembers.forEach((m) => {
        results.push({
          userId: m.userId,
          amount: m.value,
        });
      });
      break;
    }
  }

  return results;
}
