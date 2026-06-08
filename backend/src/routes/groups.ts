import { Router } from 'express';

export const groupRoutes = Router();

// GET /api/groups
groupRoutes.get('/', async (_req, res) => {
  try {
    // TODO: Fetch groups from Supabase
    res.json({ groups: [] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups
groupRoutes.post('/', async (req, res) => {
  try {
    const { name, members } = req.body;
    // TODO: Create group in Supabase
    res.status(201).json({ message: 'Group created', name, members });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
