import { Router } from 'express';
import { authGuard, AuthenticatedRequest } from '../middleware/authGuard.js';
import { supabaseAdmin } from '../utils/supabase.js';

export const notificationRoutes = Router();
notificationRoutes.use(authGuard);

// GET /api/notifications — paginated notifications list
notificationRoutes.get('/', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const { count } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null);

    res.json({
      notifications: notifications || [],
      unreadCount: count || 0,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/:id/read — mark single as read
notificationRoutes.put('/:id/read', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;

    await supabaseAdmin
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    res.json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/read-all — mark all as read
notificationRoutes.put('/read-all', async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;

    await supabaseAdmin
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);

    res.json({ message: 'All marked as read' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notifications/:id — delete a notification
notificationRoutes.delete('/:id', async (req, res, next) => {
  try {
    const user = (req as unknown as AuthenticatedRequest).user;
    const { id } = req.params;

    await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
});
