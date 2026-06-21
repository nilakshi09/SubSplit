import { Router } from 'express';
import { authGuard, AuthenticatedRequest } from '../middleware/authGuard.js';
import { supabaseAdmin } from '../utils/supabase.js';
import { scanInbox } from '../services/gmail/emailIngestion.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';
import { notifyChargeDetected } from '../services/notification/notificationService.js';

export const subscriptionRoutes = Router();

// All routes require authentication
subscriptionRoutes.use(authGuard);

// GET /api/subscriptions — list all user subscriptions
subscriptionRoutes.get('/', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { status, group_id } = req.query;

    let query = supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status as string);
    if (group_id) query = query.eq('group_id', group_id as string);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ subscriptions: data, total: data?.length || 0 });
  } catch (err) {
    next(err);
  }
});

// GET /api/subscriptions/pending — list pending subscriptions
subscriptionRoutes.get('/pending', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('owner_id', user.id)
      .eq('status', 'pending')
      .order('confidence', { ascending: false });

    if (error) throw error;

    res.json({ pending: data, total: data?.length || 0 });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscriptions/scan — trigger inbox scan
subscriptionRoutes.post('/scan', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;

    if (!user.gmailConnected) {
      return res.status(400).json({
        error: { code: 'GMAIL_NOT_CONNECTED', message: 'Please connect Gmail first' }
      });
    }

    const result = await scanInbox(user.id);

    res.json({
      message: 'Inbox scan complete',
      detected: result.detected.length,
      totalProcessed: result.total,
      errors: result.errors,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscriptions/:id/confirm — confirm pending subscription
subscriptionRoutes.post('/:id/confirm', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single();

    if (!sub) throw new NotFoundError('Subscription');

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ subscription: data });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscriptions — manually add subscription
subscriptionRoutes.post('/', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { service_name, amount, currency, frequency, billing_day, service_icon } = req.body;

    if (!service_name || !amount || !currency) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'service_name, amount, currency are required' }
      });
    }

    const fingerprint = `manual_${service_name.toLowerCase().replace(/\s/g, '_')}_${user.id.substring(0, 8)}`;

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        owner_id: user.id,
        service_name,
        service_icon: service_icon || '💳',
        amount,
        currency,
        frequency: frequency || 'monthly',
        billing_day,
        fingerprint,
        status: 'active',
        confidence: 1.00,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ subscription: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/subscriptions/:id — archive subscription
subscriptionRoutes.delete('/:id', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single();

    if (!sub) throw new NotFoundError('Subscription');

    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id);

    res.json({ message: 'Subscription archived' });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscriptions/:id/simulate-charge — DEV ONLY: manually trigger a charge for testing
subscriptionRoutes.post('/:id/simulate-charge', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single();

    if (!subscription) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Subscription not found' } });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ error: { code: 'NOT_ACTIVE', message: 'Subscription must be active' } });
    }

    const { data: chargeEvent, error } = await supabaseAdmin
      .from('charge_events')
      .insert({
        subscription_id: subscription.id,
        amount: subscription.amount,
        currency: subscription.currency,
        charged_at: new Date().toISOString(),
        auto_matched: false,
        processed: false,
      })
      .select()
      .single();

    if (error) throw error;

    const { updateGroupBalances } = await import('../services/balance/balanceUpdater.js');
    
    let balancesUpdated = false;
    if (subscription.group_id) {
      await updateGroupBalances(subscription, chargeEvent);
      balancesUpdated = true;
    }

    // Notify about the detected charge
    await notifyChargeDetected(
      user.id,
      subscription.service_name,
      subscription.amount,
      subscription.currency,
      subscription.group_id || undefined,
      subscription.id
    );

    await supabaseAdmin
      .from('subscriptions')
      .update({
        last_charged_at: chargeEvent.charged_at,
        charge_count: (subscription.charge_count || 0) + 1,
      })
      .eq('id', subscription.id);

    res.json({ chargeEvent, balancesUpdated, message: 'Charge simulated successfully' });
  } catch (err) {
    next(err);
  }
});
