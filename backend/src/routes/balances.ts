import { Router } from 'express';
import { authGuard, AuthenticatedRequest } from '../middleware/authGuard.js';
import { supabaseAdmin } from '../utils/supabase.js';
import { calculateNetSettlement } from '../services/balance/netSettlement.js';
import { AuthorizationError } from '../utils/errors.js';

export const balanceRoutes = Router();
balanceRoutes.use(authGuard);

// GET /api/groups/:id/balances — all member balances in a group
balanceRoutes.get('/groups/:id/balances', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { id: groupId } = req.params;

    // Verify user is a member
    const { data: membership } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!membership) throw new AuthorizationError('Not a member of this group');

    // Get all members
    const { data: members } = await supabaseAdmin
      .from('group_members')
      .select('user_id, users(id, name, email, avatar_url)')
      .eq('group_id', groupId);

    // Get all balances for this group
    const { data: balances } = await supabaseAdmin
      .from('balances')
      .select('*')
      .eq('group_id', groupId);

    const balanceMap = new Map(balances?.map(b => [b.user_id, b]) || []);

    const result = (members || []).map((m: any) => ({
      userId: m.user_id,
      name: m.users.name,
      email: m.users.email,
      avatarUrl: m.users.avatar_url,
      amount: balanceMap.get(m.user_id)?.amount || 0,
      currency: balanceMap.get(m.user_id)?.currency || 'INR',
    }));

    res.json({ balances: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/balances/global — user's total across all groups
balanceRoutes.get('/balances/global', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;

    const { data: balances } = await supabaseAdmin
      .from('balances')
      .select('amount, currency, group_id, groups(name, emoji)')
      .eq('user_id', user.id);

    let totalOwed = 0;
    let totalOwedToMe = 0;

    for (const b of balances || []) {
      if (b.amount > 0) totalOwed += b.amount;
      else totalOwedToMe += Math.abs(b.amount);
    }

    res.json({
      totalOwed: Math.round(totalOwed * 100) / 100,
      totalOwedToMe: Math.round(totalOwedToMe * 100) / 100,
      currency: 'INR',
      byGroup: balances,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/groups/:id/net-settlement — optimized settlement plan
balanceRoutes.get('/groups/:id/net-settlement', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { id: groupId } = req.params;

    const { data: membership } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!membership) throw new AuthorizationError('Not a member of this group');

    const { data: members } = await supabaseAdmin
      .from('group_members')
      .select('user_id, users(id, name)')
      .eq('group_id', groupId);

    const { data: balances } = await supabaseAdmin
      .from('balances')
      .select('user_id, amount')
      .eq('group_id', groupId);

    const balanceMap = new Map(balances?.map(b => [b.user_id, b.amount]) || []);

    const memberBalances = (members || []).map((m: any) => ({
      userId: m.user_id,
      name: m.users.name,
      amount: balanceMap.get(m.user_id) || 0,
    }));

    const transactions = calculateNetSettlement(memberBalances);
    const rawTransactionCount = memberBalances.filter(m => Math.abs(m.amount) > 0.01).length;

    res.json({
      settlements: transactions,
      totalTransactions: transactions.length,
      reducedFrom: rawTransactionCount,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/groups/:id/settlements — settlement history for a group
balanceRoutes.get('/groups/:id/settlements', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { id: groupId } = req.params;

    const { data: membership } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!membership) throw new AuthorizationError('Not a member of this group');

    const { data: settlements } = await supabaseAdmin
      .from('settlements')
      .select('*, payer:payer_id(id, name, avatar_url), receiver:receiver_id(id, name, avatar_url)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    res.json({ settlements: settlements || [] });
  } catch (err) {
    next(err);
  }
});
