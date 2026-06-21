import { Router } from 'express';
import { authGuard, AuthenticatedRequest } from '../middleware/authGuard.js';
import { supabaseAdmin } from '../utils/supabase.js';
import { getPaymentLinksForSettlement } from '../services/payment/linkGenerator.js';
import { ValidationError } from '../utils/errors.js';

export const paymentRoutes = Router();
paymentRoutes.use(authGuard);

// GET /api/payments/links/:settlementId — get payment links for a settlement
paymentRoutes.get('/links/:settlementId', async (req, res, next) => {
  try {
    const { settlementId } = req.params;

    const { data: settlement } = await supabaseAdmin
      .from('settlements')
      .select('*')
      .eq('id', settlementId)
      .single();

    if (!settlement) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Settlement not found' } });
    }

    const note = `SubSplit settlement`;
    const links = await getPaymentLinksForSettlement(
      settlement.receiver_id,
      settlement.amount,
      settlement.currency,
      note,
      supabaseAdmin
    );

    res.json({ links });
  } catch (err) {
    next(err);
  }
});

// PUT /api/payments/user-payment-info — set user payment info
paymentRoutes.put('/user-payment-info', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { upiId, venmoHandle, paypalEmail, preferredPayment } = req.body;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        upi_id: upiId || null,
        venmo_handle: venmoHandle || null,
        paypal_email: paypalEmail || null,
        preferred_payment: preferredPayment || 'upi',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id, upi_id, venmo_handle, paypal_email, preferred_payment')
      .single();

    if (error) throw error;

    res.json({ paymentInfo: data });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/user-payment-info — get current user payment info
paymentRoutes.get('/user-payment-info', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;

    const { data } = await supabaseAdmin
      .from('users')
      .select('upi_id, venmo_handle, paypal_email, preferred_payment')
      .eq('id', user.id)
      .single();

    res.json({ paymentInfo: data });
  } catch (err) {
    next(err);
  }
});
