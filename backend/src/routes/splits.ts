import { Router } from 'express';
import { authGuard, AuthenticatedRequest } from '../middleware/authGuard.js';
import { supabaseAdmin } from '../utils/supabase.js';
import { calculateSplit, isGroupMember } from '../services/groups/groupService.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../utils/errors.js';

export const splitRoutes = Router();

// All routes require authentication
splitRoutes.use(authGuard);

// ─── 1. GET /api/splits/:subscriptionId ─────────────────────────────────────────
// Fetch current split rules for a subscription
splitRoutes.get('/:subscriptionId', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { subscriptionId } = req.params;

    // Verify ownership
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('id, split_type')
      .eq('id', subscriptionId)
      .eq('owner_id', user.id)
      .single();

    if (!sub) throw new NotFoundError('Subscription');

    // Fetch split rules
    const { data: rules, error } = await supabaseAdmin
      .from('split_rules')
      .select('user_id, split_type, value, is_excluded')
      .eq('subscription_id', subscriptionId);

    if (error) throw error;

    res.json({
      splitType: sub.split_type || 'equal',
      rules: (rules || []).map((r: any) => ({
        userId: r.user_id,
        value: r.value,
        isExcluded: r.is_excluded,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ─── 2. PUT /api/splits/:subscriptionId ─────────────────────────────────────────
// Update split rules for a subscription
splitRoutes.put('/:subscriptionId', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { subscriptionId } = req.params;
    const { splitType, rules } = req.body;

    // Validate splitType
    if (!splitType || !['equal', 'percentage', 'fixed'].includes(splitType)) {
      throw new ValidationError('splitType must be equal, percentage, or fixed');
    }

    // Verify ownership
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('id, amount, owner_id')
      .eq('id', subscriptionId)
      .eq('owner_id', user.id)
      .single();

    if (!sub) throw new NotFoundError('Subscription');

    // Validate rules
    if (!Array.isArray(rules) || rules.length === 0) {
      throw new ValidationError('rules must be a non-empty array');
    }

    const activeRules = rules.filter((r: any) => !r.isExcluded);

    if (splitType === 'percentage') {
      const total = activeRules.reduce((sum: number, r: any) => sum + (r.value || 0), 0);
      if (Math.abs(total - 100) > 0.1) {
        throw new ValidationError('Percentage values must sum to 100');
      }
    }

    if (splitType === 'fixed') {
      const total = activeRules.reduce((sum: number, r: any) => sum + (r.value || 0), 0);
      if (Math.abs(total - sub.amount) > 1) {
        throw new ValidationError(`Fixed values must sum to the subscription amount (${sub.amount})`);
      }
    }

    // Delete existing rules
    await supabaseAdmin
      .from('split_rules')
      .delete()
      .eq('subscription_id', subscriptionId);

    // Insert new rules
    const newRules = rules.map((r: any) => ({
      subscription_id: subscriptionId,
      user_id: r.userId,
      split_type: splitType,
      value: r.value || 0,
      is_excluded: r.isExcluded || false,
    }));

    const { error: insertErr } = await supabaseAdmin
      .from('split_rules')
      .insert(newRules);

    if (insertErr) throw insertErr;

    // Update subscription split_type
    await supabaseAdmin
      .from('subscriptions')
      .update({ split_type: splitType })
      .eq('id', subscriptionId);

    // Calculate preview
    const preview = await calculateSplit(
      sub.amount,
      splitType,
      sub.owner_id,
      rules.map((r: any) => ({
        userId: r.userId,
        value: r.value || 0,
        isExcluded: r.isExcluded || false,
      })),
    );

    res.json({
      splitType,
      rules: rules.map((r: any) => ({
        userId: r.userId,
        value: r.value || 0,
        isExcluded: r.isExcluded || false,
      })),
      preview,
    });
  } catch (err) {
    next(err);
  }
});

// ─── 3. GET /api/splits/:subscriptionId/preview ─────────────────────────────────
// Preview the calculated split amounts
splitRoutes.get('/:subscriptionId/preview', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { subscriptionId } = req.params;

    // Verify ownership
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('id, amount, currency, owner_id, group_id, split_type')
      .eq('id', subscriptionId)
      .eq('owner_id', user.id)
      .single();

    if (!sub) throw new NotFoundError('Subscription');

    // Fetch split rules
    const { data: rules, error: rulesErr } = await supabaseAdmin
      .from('split_rules')
      .select('user_id, value, is_excluded')
      .eq('subscription_id', subscriptionId);

    if (rulesErr) throw rulesErr;

    if (!rules || rules.length === 0) {
      return res.json({ preview: [] });
    }

    // Fetch group members for names
    let memberNames: Record<string, string> = {};
    if (sub.group_id) {
      const { data: members } = await supabaseAdmin
        .from('group_members')
        .select('user_id, users(name)')
        .eq('group_id', sub.group_id);

      if (members) {
        members.forEach((m: any) => {
          memberNames[m.user_id] = m.users?.name || 'Unknown';
        });
      }
    }

    // Calculate split
    const splitResult = await calculateSplit(
      sub.amount,
      (sub.split_type as 'equal' | 'percentage' | 'fixed') || 'equal',
      sub.owner_id,
      rules.map((r: any) => ({
        userId: r.user_id,
        value: r.value,
        isExcluded: r.is_excluded,
      })),
    );

    const preview = splitResult.map((s) => ({
      userId: s.userId,
      name: memberNames[s.userId] || 'Unknown',
      amount: s.amount,
      currency: sub.currency,
    }));

    res.json({ preview });
  } catch (err) {
    next(err);
  }
});

// ─── 4. POST /api/splits/assign/:id ────────────────────────────────────────────
// Assign a subscription to a group and auto-create equal split rules
splitRoutes.post('/assign/:id', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;
    const { groupId } = req.body;

    if (!groupId) {
      throw new ValidationError('groupId is required');
    }

    // Check user owns subscription
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single();

    if (!sub) throw new NotFoundError('Subscription');

    // Check user is member of the group
    const member = await isGroupMember(groupId, user.id);
    if (!member) {
      throw new AuthorizationError('You are not a member of this group');
    }

    // Update subscription with group_id
    const { data: updatedSub, error: updErr } = await supabaseAdmin
      .from('subscriptions')
      .update({ group_id: groupId, split_type: 'equal' })
      .eq('id', id)
      .select()
      .single();

    if (updErr) throw updErr;

    // Fetch group members
    const { data: members, error: memErr } = await supabaseAdmin
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (memErr) throw memErr;

    // Delete any existing split rules
    await supabaseAdmin
      .from('split_rules')
      .delete()
      .eq('subscription_id', id);

    // Create equal split rules for all group members
    const splitCount = (members || []).length;
    const equalValue = splitCount > 0 ? Math.round((100 / splitCount) * 100) / 100 : 0;

    const splitRules = (members || []).map((m: any) => ({
      subscription_id: id,
      user_id: m.user_id,
      split_type: 'equal',
      value: equalValue,
      is_excluded: false,
    }));

    const { data: insertedRules, error: insErr } = await supabaseAdmin
      .from('split_rules')
      .insert(splitRules)
      .select();

    if (insErr) throw insErr;

    res.json({
      subscription: updatedSub,
      splitRules: insertedRules,
    });
  } catch (err) {
    next(err);
  }
});
