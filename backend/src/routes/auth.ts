import { Router } from 'express';

export const authRoutes = Router();

// POST /api/auth/signup
authRoutes.post('/signup', async (req, res) => {
  try {
    const { email } = req.body;
    // TODO: Implement signup with Supabase Auth
    res.json({ message: 'Signup endpoint', email });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
authRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // TODO: Implement login with Supabase Auth
    res.json({ message: 'Login endpoint', email });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
