<div align="center">

# 🔀 SubSplit

**Your subscriptions. Split automatically.**

SubSplit reads your billing emails and settles the math with your group — silently, every month, without anyone lifting a finger.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E.svg)](https://supabase.com)

---

</div>

## ✨ Features

- 📧 **Gmail Integration** — Automatically detects subscription charges from billing emails
- 👥 **Group Management** — Create groups and assign members to shared subscriptions
- 💸 **Auto-Split** — Calculates each member's share and sends payment reminders
- 🔗 **One-Tap Payments** — Generates Venmo, PayPal, and UPI payment links
- 🔒 **Privacy-First** — Only billing line-items are stored, never email content

## 🏗️ Project Structure

```
SubSplit/
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Problem.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── SubscriptionShowcase.tsx
│   │   │   ├── EmotionalAnchor.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── FinalCTA.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── FadeInOnScroll.tsx
│   │   ├── data/            # Constants and static data
│   │   ├── App.tsx          # Root component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                 # Express + TypeScript API
│   ├── src/
│   │   ├── config/          # Supabase client configuration
│   │   ├── routes/          # API route handlers
│   │   │   ├── auth.ts
│   │   │   ├── subscriptions.ts
│   │   │   └── groups.ts
│   │   ├── middleware/       # Auth & validation middleware
│   │   ├── utils/           # Email parser & helpers
│   │   └── index.ts         # Server entry point
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- [Supabase](https://supabase.com/) account (for backend)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend

```bash
cd backend
cp .env.example .env     # Configure your environment variables
npm install
npm run dev
```

The API will be available at `http://localhost:3001`

## 🛠️ Tech Stack

| Layer      | Technology                                                    |
| ---------- | ------------------------------------------------------------- |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion       |
| Backend    | Node.js, Express, TypeScript                                  |
| Database   | Supabase (PostgreSQL)                                         |
| Auth       | Supabase Auth                                                 |
| Deployment | Vercel (frontend) + Railway/Render (backend)                  |

## 📡 API Endpoints

| Method   | Endpoint                | Description               |
| -------- | ----------------------- | ------------------------- |
| `GET`    | `/api/health`           | Health check              |
| `POST`   | `/api/auth/signup`      | Create a new account      |
| `POST`   | `/api/auth/login`       | Login to existing account |
| `GET`    | `/api/subscriptions`    | List all subscriptions    |
| `POST`   | `/api/subscriptions`    | Add a new subscription    |
| `DELETE` | `/api/subscriptions/:id`| Remove a subscription     |
| `GET`    | `/api/groups`           | List all groups           |
| `POST`   | `/api/groups`           | Create a new group        |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">
  <sub>Made for friend groups everywhere. 💚</sub>
</div>
