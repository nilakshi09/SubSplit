# SubSplit — Automatic Subscription Splitting

> Split shared subscriptions automatically. Connect Gmail, create groups, and let SubSplit handle the math — every month, without anyone lifting a finger.

## 🌐 Live Demo
- **App:** https://sub-split-one.vercel.app
- **API:** https://subsplit-backend.onrender.com/api/health

## ✨ Features
- **Gmail Integration** — Automatically detects billing emails from 35+ services
- **Smart Parsing** — Extracts service name, amount, and billing date
- **Group Management** — Create groups, invite friends via link
- **Automatic Splitting** — Equal, percentage, or fixed splits
- **Balance Tracking** — Real-time balance updates on every charge
- **Settlement Flow** — One-tap payment via UPI, Venmo, or PayPal
- **Smart Notifications** — Charge alerts, payment reminders, escalating nudges
- **Background Automation** — Cron jobs for reminders and cancellation detection

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework & build tool |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Zustand | State management |
| React Router v6 | Client-side routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | API server |
| TypeScript | Type safety |
| Supabase (PostgreSQL) | Database + Auth |
| Google OAuth 2.0 | Authentication |
| Gmail API | Email reading |
| JWT | Session management |
| node-cron | Background jobs |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Supabase | Database + RLS |
| Google Cloud | OAuth + Gmail API |

## 🏗️ Architecture
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React + Vite  │────▶│  Node + Express │────▶│    Supabase     │
│   (Vercel CDN)  │     │  (Render.com)   │     │  (PostgreSQL)   │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
                Gmail API    node-cron    Notifications
               (OAuth 2.0)  (Background   (In-app alerts)
                               Jobs)

## 📁 Project Structure
SubSplit/
├── frontend/          # React + Vite + TypeScript
│   └── src/
│       ├── components/  # UI components
│       ├── pages/       # Route pages
│       ├── stores/      # Zustand state
│       ├── hooks/       # Custom hooks
│       └── lib/         # API client
│
├── backend/           # Node.js + Express + TypeScript
│   └── src/
│       ├── routes/      # API endpoints
│       ├── services/    # Business logic
│       │   ├── gmail/   # Email ingestion
│       │   ├── parser/  # Email parsing engine
│       │   ├── balance/ # Balance calculations
│       │   └── notification/ # Alerts
│       ├── jobs/        # Background cron jobs
│       └── middleware/  # Auth, rate limiting
│
└── docs/              # Documentation

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud Console project

### Setup

1. Clone the repository
```bash
git clone https://github.com/nilakshi09/SubSplit.git
cd SubSplit
```

2. Backend setup
```bash
cd backend
cp .env.example .env
# Fill in your environment variables
npm install
npm run dev
```

3. Frontend setup
```bash
cd frontend
cp .env.example .env
# Add VITE_API_URL=http://localhost:3001
npm install
npm run dev
```

### Environment Variables

**Backend `.env`:**
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
TOKEN_ENCRYPTION_KEY=your_encryption_key
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3001
```

## 📊 Database Schema

Key tables:
- `users` — User profiles + Gmail tokens (encrypted)
- `subscriptions` — Detected/manual subscriptions
- `groups` — Friend groups
- `group_members` — Group membership
- `split_rules` — How costs are divided
- `balances` — Running balance per user per group
- `settlements` — Payment records
- `notifications` — In-app alerts
- `charge_events` — Billing history

## 🔒 Security
- OAuth tokens encrypted with AES-256 at rest
- JWT authentication with 24h expiry
- Row Level Security (RLS) on all Supabase tables
- Rate limiting: 100 req/min per user
- CORS whitelist for production domains
- No raw email content stored — only extracted metadata

## 🤖 Background Jobs
| Job | Schedule | Purpose |
|-----|----------|---------|
| Email Poller | Every 5 min | Scan Gmail for new billing emails |
| Reminder Sender | Every hour | Send payment reminders |
| Cancellation Detector | Daily 6 AM | Flag unused subscriptions |
| Monthly Summary | 1st of month | Send monthly balance report |

## 📱 Screenshots
> Dashboard, Groups, Subscriptions, Settings pages

## 🙏 Acknowledgments
Built by **Nilakshi Rahangdale** — B.Tech CS, PIEMR Indore

---

Made with ❤️ using React, Node.js, and Supabase
