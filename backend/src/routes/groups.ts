import { Router } from 'express';
import { authGuard, AuthenticatedRequest } from '../middleware/authGuard.js';
import { supabaseAdmin } from '../utils/supabase.js';
import { env } from '../config/env.js';
import {
  NotFoundError,
  AuthorizationError,
  ConflictError,
  ValidationError,
} from '../utils/errors.js';
import {
  generateInviteCode,
  isGroupAdmin,
  isGroupMember,
  getGroupWithMembers,
} from '../services/groups/groupService.js';

export const groupRoutes = Router();

// All routes require authentication
groupRoutes.use(authGuard);

// ─── 1. GET /api/groups ─────────────────────────────────────────────────────────
// List all groups the authenticated user belongs to
groupRoutes.get('/', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;

    // Get group IDs user belongs to
    const { data: memberships, error: memErr } = await supabaseAdmin
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);

    if (memErr) throw memErr;

    const groupIds = (memberships || []).map((m: any) => m.group_id);

    if (groupIds.length === 0) {
      return res.json({ groups: [], total: 0 });
    }

    // Fetch groups
    const { data: groups, error: grpErr } = await supabaseAdmin
      .from('groups')
      .select('*')
      .in('id', groupIds);

    if (grpErr) throw grpErr;

    // Enrich each group with member_count and subscription_count
    const enriched = await Promise.all(
      (groups || []).map(async (group: any) => {
        const { count: memberCount } = await supabaseAdmin
          .from('group_members')
          .select('id', { count: 'exact', head: true })
          .eq('group_id', group.id);

        const { count: subscriptionCount } = await supabaseAdmin
          .from('subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('group_id', group.id);

        return {
          ...group,
          member_count: memberCount || 0,
          subscription_count: subscriptionCount || 0,
        };
      }),
    );

    res.json({ groups: enriched, total: enriched.length });
  } catch (err) {
    next(err);
  }
});

// ─── 2. POST /api/groups ────────────────────────────────────────────────────────
// Create a new group
groupRoutes.post('/', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { name, description, emoji } = req.body;

    // Validate
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('name is required');
    }
    if (name.length > 50) {
      throw new ValidationError('name must be 50 characters or less');
    }

    const inviteCode = generateInviteCode();

    // Insert group
    const { data: group, error: grpErr } = await supabaseAdmin
      .from('groups')
      .insert({
        name: name.trim(),
        description: description || null,
        emoji: emoji || '👥',
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select()
      .single();

    if (grpErr) throw grpErr;

    // Add creator as admin
    const { error: memErr } = await supabaseAdmin
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'admin',
      });

    if (memErr) throw memErr;

    // Insert default group settings
    const { error: setErr } = await supabaseAdmin
      .from('group_settings')
      .insert({
        group_id: group.id,
        reminder_enabled: true,
        reminder_delay_days: 1,
        nudge_delay_days: 3,
        final_notice_delay_days: 7,
        min_reminder_amount: 0,
      });

    if (setErr) throw setErr;

    const inviteUrl = `${env.FRONTEND_URL}/join/${inviteCode}`;

    res.status(201).json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        emoji: group.emoji,
        inviteCode,
        inviteUrl,
        members: [
          {
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'admin',
          },
        ],
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── 3. GET /api/groups/:id ─────────────────────────────────────────────────────
// Get group details with members and subscriptions
groupRoutes.get('/:id', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;

    const result = await getGroupWithMembers(id, user.id);

    if (!result) {
      throw new AuthorizationError('You are not a member of this group');
    }

    res.json({
      group: result.group,
      members: result.members,
      subscriptions: result.subscriptions,
    });
  } catch (err) {
    next(err);
  }
});

// ─── 4. PUT /api/groups/:id ─────────────────────────────────────────────────────
// Update group details (admin only)
groupRoutes.put('/:id', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;
    const { name, description, emoji } = req.body;

    const admin = await isGroupAdmin(id, user.id);
    if (!admin) {
      throw new AuthorizationError('Only group admins can update the group');
    }

    // Build update payload, only set provided fields
    const updates: Record<string, any> = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new ValidationError('name cannot be empty');
      }
      if (name.length > 50) {
        throw new ValidationError('name must be 50 characters or less');
      }
      updates.name = name.trim();
    }
    if (description !== undefined) updates.description = description;
    if (emoji !== undefined) updates.emoji = emoji;

    const { data: group, error } = await supabaseAdmin
      .from('groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ group });
  } catch (err) {
    next(err);
  }
});

// ─── 5. DELETE /api/groups/:id ──────────────────────────────────────────────────
// Delete a group (only the creator/admin)
groupRoutes.delete('/:id', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;

    // Only the group creator can delete it
    const { data: group } = await supabaseAdmin
      .from('groups')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!group) throw new NotFoundError('Group');
    if (group.created_by !== user.id) {
      throw new AuthorizationError('Only the group creator can delete the group');
    }

    // Unassign subscriptions from this group
    await supabaseAdmin
      .from('subscriptions')
      .update({ group_id: null })
      .eq('group_id', id);

    // Delete group (cascade handles group_members, group_settings)
    const { error } = await supabaseAdmin
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Group deleted' });
  } catch (err) {
    next(err);
  }
});

// ─── 6. POST /api/groups/:id/invite ─────────────────────────────────────────────
// Generate a new invite link (admin only)
groupRoutes.post('/:id/invite', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;
    const { maxUses, expiresIn } = req.body; // expiresIn in hours

    const admin = await isGroupAdmin(id, user.id);
    if (!admin) {
      throw new AuthorizationError('Only admins can generate invite links');
    }

    const inviteCode = generateInviteCode();
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await supabaseAdmin
      .from('groups')
      .update({
        invite_code: inviteCode,
        invite_uses: 0,
        invite_max_uses: maxUses || null,
        invite_expires: expiresAt,
      })
      .eq('id', id);

    if (error) throw error;

    const inviteUrl = `${env.FRONTEND_URL}/join/${inviteCode}`;

    res.json({ inviteCode, inviteUrl, expiresAt });
  } catch (err) {
    next(err);
  }
});

// ─── 7. POST /api/groups/join/:code ─────────────────────────────────────────────
// Join a group via invite code
groupRoutes.post('/join/:code', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { code } = req.params;

    // Find group by invite code
    const { data: group, error: grpErr } = await supabaseAdmin
      .from('groups')
      .select('*')
      .eq('invite_code', code)
      .single();

    if (grpErr || !group) {
      throw new NotFoundError('Invite link');
    }

    // Check if already a member
    const alreadyMember = await isGroupMember(group.id, user.id);
    if (alreadyMember) {
      throw new ConflictError('You are already a member of this group');
    }

    // Check invite_max_uses
    if (group.invite_max_uses !== null && group.invite_uses >= group.invite_max_uses) {
      throw new ValidationError('Invite link has reached its maximum uses');
    }

    // Check invite expiry
    if (group.invite_expires && new Date(group.invite_expires) < new Date()) {
      throw new ValidationError('Invite link has expired');
    }

    // Add user as member
    const { error: memErr } = await supabaseAdmin
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'member',
      });

    if (memErr) throw memErr;

    // Increment invite uses
    const { error: updErr } = await supabaseAdmin
      .from('groups')
      .update({ invite_uses: (group.invite_uses || 0) + 1 })
      .eq('id', group.id);

    if (updErr) throw updErr;

    res.json({
      group: { id: group.id, name: group.name, emoji: group.emoji },
      message: 'Joined successfully',
    });
  } catch (err) {
    next(err);
  }
});

// ─── 8. DELETE /api/groups/:id/members/:userId ──────────────────────────────────
// Remove a member from the group (admin only)
groupRoutes.delete('/:id/members/:userId', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id, userId } = req.params;

    const admin = await isGroupAdmin(id, user.id);
    if (!admin) {
      throw new AuthorizationError('Only admins can remove members');
    }

    // Cannot remove yourself if you're the only admin
    if (userId === user.id) {
      const { count } = await supabaseAdmin
        .from('group_members')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', id)
        .eq('role', 'admin');

      if ((count || 0) <= 1) {
        throw new ValidationError('Cannot remove the only admin. Transfer admin role first.');
      }
    }

    const { error } = await supabaseAdmin
      .from('group_members')
      .delete()
      .eq('group_id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
});

// ─── 9. POST /api/groups/:id/leave ──────────────────────────────────────────────
// Leave a group
groupRoutes.post('/:id/leave', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;

    const member = await isGroupMember(id, user.id);
    if (!member) {
      throw new NotFoundError('Group membership');
    }

    // Check if user is the only admin
    const adminCheck = await isGroupAdmin(id, user.id);
    if (adminCheck) {
      const { count } = await supabaseAdmin
        .from('group_members')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', id)
        .eq('role', 'admin');

      if ((count || 0) <= 1) {
        throw new ValidationError('Transfer admin role before leaving');
      }
    }

    const { error } = await supabaseAdmin
      .from('group_members')
      .delete()
      .eq('group_id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    res.json({ message: 'Left group' });
  } catch (err) {
    next(err);
  }
});

// ─── 10. GET /api/groups/:id/members ────────────────────────────────────────────
// List all members of a group
groupRoutes.get('/:id/members', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;

    const member = await isGroupMember(id, user.id);
    if (!member) {
      throw new AuthorizationError('You are not a member of this group');
    }

    const { data: memberRows, error } = await supabaseAdmin
      .from('group_members')
      .select('id, user_id, role, joined_at, users(id, name, email, avatar_url)')
      .eq('group_id', id);

    if (error) throw error;

    const members = (memberRows || []).map((m: any) => ({
      id: m.id,
      userId: m.user_id,
      name: m.users?.name || null,
      email: m.users?.email || null,
      avatarUrl: m.users?.avatar_url || null,
      role: m.role,
      joinedAt: m.joined_at,
    }));

    res.json({ members });
  } catch (err) {
    next(err);
  }
});
