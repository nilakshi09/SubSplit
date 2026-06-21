import { Router } from 'express';
import { authGuard, AuthenticatedRequest } from '../middleware/authGuard.js';
import { supabaseAdmin } from '../utils/supabase.js';
import { recordSettlementBalance } from '../services/balance/balanceUpdater.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../utils/errors.js';
import { notifySettlementReceived, notifySettlementConfirmed } from '../services/notification/notificationService.js';

export const settlementRoutes = Router();
settlementRoutes.use(authGuard);

// POST /api/settlements — record a settle-up (creates pending settlement)
settlementRoutes.post('/', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { receiverId, groupId, amount, currency, method, note } = req.body;

    if (!receiverId || !groupId || !amount || amount <= 0) {
      throw new ValidationError('receiverId, groupId, and positive amount are required');
    }

    // Verify both users are members of the group
    const { data: members } = await supabaseAdmin
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .in('user_id', [user.id, receiverId]);

    if (!members || members.length < 2) {
      throw new ValidationError('Both users must be members of this group');
    }

    const { data: settlement, error } = await supabaseAdmin
      .from('settlements')
      .insert({
        payer_id: user.id,
        receiver_id: receiverId,
        group_id: groupId,
        amount,
        currency: currency || 'INR',
        method: method || 'manual',
        note,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Notify receiver about the pending settlement
    const { data: payer } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();

    await notifySettlementReceived(
      settlement.receiver_id,
      payer?.name || 'Someone',
      settlement.amount,
      settlement.currency,
      settlement.group_id,
      settlement.id
    );

    res.status(201).json({ settlement });
  } catch (err) {
    next(err);
  }
});

// POST /api/settlements/:id/confirm — receiver confirms payment received
settlementRoutes.post('/:id/confirm', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;

    const { data: settlement } = await supabaseAdmin
      .from('settlements')
      .select('*')
      .eq('id', id)
      .single();

    if (!settlement) throw new NotFoundError('Settlement');
    if (settlement.receiver_id !== user.id) {
      throw new AuthorizationError('Only the receiver can confirm this settlement');
    }
    if (settlement.status !== 'pending') {
      throw new ValidationError('Settlement is not pending');
    }

    // Update settlement status
    const { data: updated, error } = await supabaseAdmin
      .from('settlements')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Apply balance changes
    await recordSettlementBalance(
      settlement.payer_id,
      settlement.receiver_id,
      settlement.group_id,
      settlement.amount,
      settlement.currency,
      settlement.id
    );

    // Notify payer that their settlement was confirmed
    const { data: receiver } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();

    await notifySettlementConfirmed(
      settlement.payer_id,
      receiver?.name || 'Someone',
      settlement.amount,
      settlement.currency,
      settlement.group_id,
      settlement.id
    );

    res.json({ settlement: updated, message: 'Settlement confirmed' });
  } catch (err) {
    next(err);
  }
});

// POST /api/settlements/:id/reject — receiver rejects (didn't receive payment)
settlementRoutes.post('/:id/reject', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;

    const { data: settlement } = await supabaseAdmin
      .from('settlements')
      .select('*')
      .eq('id', id)
      .single();

    if (!settlement) throw new NotFoundError('Settlement');
    if (settlement.receiver_id !== user.id) {
      throw new AuthorizationError('Only the receiver can reject this settlement');
    }

    const { data: updated, error } = await supabaseAdmin
      .from('settlements')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ settlement: updated, message: 'Settlement rejected' });
  } catch (err) {
    next(err);
  }
});
