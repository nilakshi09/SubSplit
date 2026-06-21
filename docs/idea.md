# SubSplit — Automatic Subscription Splitting for Friend Groups

## The Problem

Shared subscriptions have quietly become one of the most common micro-financial arrangements in everyday life. Friend groups share Netflix, Spotify family plans, iCloud storage, Amazon Prime, ChatGPT Plus — each one a small recurring charge that someone in the group is fronting on behalf of everyone else.

The social friction of collecting these small amounts is real: **nobody wants to be the person chasing their friends for ₹250 every month.** So one person absorbs the cost indefinitely, or the situation creates low-grade resentment that nobody addresses directly.

### Why Existing Solutions Fall Short

| Tool | What It Does | Why It Fails |
|------|-------------|--------------|
| **Splitwise** | Manual expense logging | Requires someone to remember, log, and categorize every charge every month |
| **Group Chats** | Informal reminders | Awkward, easy to ignore, creates social tension |
| **Venmo / UPI Reminders** | Payment requests | Still manual — someone has to initiate each time |
| **Spreadsheets** | Tracking balances | Nobody maintains them after week two |

The core failure is the same across all of them: **they require manual input, every single time.** Someone has to remember the charge happened, remember the amount, remember who owes what, and then log it or send a message. When the charge recurs every month, this becomes a recurring chore. Most people simply stop bothering, and the imbalance quietly accumulates.

---

## The Solution

SubSplit eliminates the manual loop entirely.

### How It Works

```
Gmail Inbox → Billing Email Detected → Subscription Identified → Group Notified → Balances Updated → Payment Link Sent
```

1. **Connect to Gmail** — SubSplit authenticates via OAuth and reads incoming billing confirmation emails.
2. **Parse & Detect** — A parsing layer identifies recurring subscription charges — detecting the service name, the amount, and the billing cycle.
3. **Assign Once** — The user assigns the subscription to a group and sets the split (equal, custom percentages, or fixed amounts).
4. **Autopilot** — Every time the charge lands in the inbox, SubSplit automatically:
   - Updates each member's balance
   - Notifies the group
   - Sends a smart reminder to anyone who hasn't settled up — with a **one-tap payment link** attached

### The Core Technical Insight

> The recurring detection engine is the heart of SubSplit. It learns that a ₹1,329 Netflix charge on the 14th of every month is **the same subscription**, not a new expense to categorize each time. You set it up once. After that, it runs in the background without anyone touching it.

---

## Key Features

### 🔍 Smart Email Parsing
- Connects to Gmail via OAuth 2.0
- Identifies billing confirmation emails from known subscription services
- Extracts service name, amount, billing date, and frequency
- Learns to recognize new subscription formats over time

### 🔄 Recurring Detection Engine
- Fingerprints each subscription by service + amount + cycle
- Matches new billing emails to existing subscriptions automatically
- Handles price changes, plan upgrades, and billing date shifts gracefully

### 👥 Group & Split Management
- Create groups for different friend circles (roommates, family, college squad)
- Flexible split options: equal, percentage-based, or fixed amounts
- One person "owns" the subscription; others are assigned their share

### 📊 Live Balance Tracking
- Running balance per person across all shared subscriptions
- Monthly summary showing who owes whom and how much
- Net settlement — instead of 6 transactions, one person pays one other person

### 🔔 Smart Notifications
- Automatic alerts when a new charge is detected
- Gentle reminders to members who haven't settled up
- Escalation logic: reminder → nudge → final notice (configurable)

### 💸 One-Tap Payment
- Deep links to UPI apps / Venmo / PayPal for instant settlement
- "Mark as Paid" confirmation to close the loop
- Payment history for transparency

---

## User Flow

```
┌─────────────────────────────────────────────────────────┐
│                    FIRST-TIME SETUP                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Sign up → Connect Gmail                              │
│  2. SubSplit scans inbox → surfaces detected subs        │
│  3. User confirms subscriptions they want to split       │
│  4. User creates group → adds friends (invite link)      │
│  5. User assigns subscriptions to group + sets split     │
│                                                          │
│                    ✅ DONE. That's it.                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  MONTHLY AUTOPILOT                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📧 Netflix billing email arrives                        │
│       ↓                                                  │
│  🔍 SubSplit detects: "Netflix – ₹1,329 – Monthly"      │
│       ↓                                                  │
│  📊 Balances updated: each member owes ₹332.25           │
│       ↓                                                  │
│  🔔 Group notified: "Netflix charged. You owe ₹332.25"  │
│       ↓                                                  │
│  💸 Payment link attached: [Pay Now →]                   │
│       ↓                                                  │
│  ⏰ Reminders sent to anyone who hasn't paid in 3 days   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Architecture Overview

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend   │────▶│   Backend API    │────▶│   Database       │
│  (React/Web) │     │  (Node/Express)  │     │  (PostgreSQL)    │
└──────────────┘     └──────┬───────────┘     └─────────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
              ┌─────▼─────┐  ┌──────▼──────┐
              │  Gmail API │  │ Notification │
              │  Listener  │  │   Service    │
              └─────┬──────┘  └──────┬──────┘
                    │                │
              ┌─────▼──────┐  ┌─────▼───────┐
              │  Parsing &  │  │  Payment     │
              │  Detection  │  │  Links       │
              │  Engine     │  │  Generator   │
              └─────────────┘  └─────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **Email Integration** | Gmail API (OAuth 2.0) |
| **Notifications** | Web Push + Email |
| **Payments** | UPI deep links / Venmo / PayPal URLs |
| **Hosting** | Vercel (frontend) + Railway/Render (backend) |
| **Auth** | Google OAuth 2.0 |

---

## What Makes SubSplit Different

| | Traditional Splitting | SubSplit |
|---|---|---|
| **Trigger** | Manual | Automatic (email-based) |
| **Frequency** | One-time or remembered | Every billing cycle, forever |
| **Effort** | Log → Calculate → Request → Collect | Set up once → autopilot |
| **Social Cost** | High (chasing friends) | Low (system sends reminders) |
| **Accuracy** | Human memory | Exact charge from billing email |

---

## Target Users

1. **College friend groups** sharing Spotify, Netflix, YouTube Premium
2. **Roommates** splitting internet, streaming, cloud storage
3. **Couples** sharing family plans across services
4. **Small teams** sharing productivity tools (Notion, Figma, ChatGPT)
5. **Family members** on shared plans who want transparent accounting

---

## Revenue Model (Future)

- **Free tier** — up to 2 subscriptions, 1 group
- **Pro** — unlimited subscriptions, unlimited groups, payment tracking, monthly reports
- **Premium** — auto-settlement via integrated payments, advanced analytics

---

## Summary

> SubSplit takes the most annoying recurring social transaction — splitting shared subscriptions — and makes it fully automatic. Connect your email. Tell it who shares what. Never think about it again.
