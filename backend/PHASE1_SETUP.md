# Phase 1 Manual Setup Steps

## 1. Google Cloud Console
- Go to [console.cloud.google.com](https://console.cloud.google.com)
- Create new project: **"SubSplit"**
- Enable **Gmail API**
- Enable **Google+ API** (for profile info)
- Go to **Credentials → Create OAuth 2.0 Client ID**
- Application type: **Web application**
- Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
- Copy **Client ID** and **Client Secret** to `.env`

## 2. Supabase Setup
- Go to [supabase.com](https://supabase.com) → your project
- Go to **SQL Editor**
- Run the users table SQL (provided separately)
- Go to **Settings → API** → copy URL and service role key to `.env`

## 3. Fill backend/.env
- Copy `.env.example` to `.env`
- Fill all values
- `JWT_SECRET`: run `openssl rand -hex 32` in terminal
- `TOKEN_ENCRYPTION_KEY`: run `openssl rand -hex 16` in terminal

## 4. Fill frontend/.env
- Create `frontend/.env`
- `VITE_API_URL=http://localhost:5173`

## 5. Verification Checklist
- [ ] `http://localhost:5173/` → landing page loads
- [ ] `http://localhost:5173/login` → login page loads with Google button
- [ ] Click "Continue with Google" → redirects to Google
- [ ] After Google auth → redirects to `/dashboard`
- [ ] Dashboard shows "Good morning, {your name}"
- [ ] Refresh `/dashboard` → still on dashboard (cookie persists)
- [ ] Visit `/dashboard` logged out → redirects to `/login`
- [ ] `http://localhost:3001/api/health` → `{ status: "ok", database: "ok" }`
- [ ] Logout button → redirects to `/login`
