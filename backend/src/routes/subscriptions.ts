import { Router } from 'express';

export const subscriptionRoutes = Router();

// GET /api/subscriptions
subscriptionRoutes.get('/', async (_req, res) => {
  try {
    // TODO: Fetch subscriptions from Supabase
    res.json({ subscriptions: [] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/subscriptions
subscriptionRoutes.post('/', async (req, res) => {
  try {
    const { name, price, members } = req.body;
    // TODO: Create subscription in Supabase
    res.status(201).json({ message: 'Subscription created', name, price, members });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/subscriptions/:id
subscriptionRoutes.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Delete subscription from Supabase
    res.json({ message: 'Subscription deleted', id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
