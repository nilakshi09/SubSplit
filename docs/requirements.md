# SubSplit — Requirements Document

> Derived from [idea.md](file:///c:/Users/nilak/OneDrive/Desktop/SubSplit/idea.md)

---

## Table of Contents

1. [Functional Requirements](#1-functional-requirements)
   - [1.1 Authentication & Onboarding](#11-authentication--onboarding)
   - [1.2 Gmail Integration & Email Ingestion](#12-gmail-integration--email-ingestion)
   - [1.3 Subscription Detection & Parsing Engine](#13-subscription-detection--parsing-engine)
   - [1.4 Recurring Detection Engine](#14-recurring-detection-engine)
   - [1.5 Group Management](#15-group-management)
   - [1.6 Split Configuration](#16-split-configuration)
   - [1.7 Balance Tracking & Settlement](#17-balance-tracking--settlement)
   - [1.8 Notifications & Reminders](#18-notifications--reminders)
   - [1.9 Payment Integration](#19-payment-integration)
   - [1.10 Dashboard & Reporting](#110-dashboard--reporting)
2. [Non-Functional Requirements](#2-non-functional-requirements)
3. [Data Models](#3-data-models)
4. [API Requirements](#4-api-requirements)
5. [Third-Party Dependencies](#5-third-party-dependencies)
6. [Phased Rollout](#6-phased-rollout)

---

## 1. Functional Requirements

### 1.1 Authentication & Onboarding

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| AUTH-01 | Users must sign up / log in via **Google OAuth 2.0** | P0 | User can authenticate with their Google account and a session is created |
| AUTH-02 | On first login, prompt the user to **grant Gmail read access** (scope: `gmail.readonly`) | P0 | OAuth consent screen requests only `gmail.readonly`; token is stored securely |
| AUTH-03 | Store OAuth refresh tokens securely (encrypted at rest) | P0 | Tokens are AES-256 encrypted in the database; never exposed in API responses |
| AUTH-04 | Allow users to **revoke Gmail access** from settings | P1 | Revoking access deletes stored tokens and stops email ingestion |
| AUTH-05 | Display a guided onboarding flow on first login (connect Gmail → scan → confirm subs → create group) | P1 | User completes all 4 onboarding steps; progress is persisted if they leave mid-flow |
| AUTH-06 | Support **session management** — users can view and terminate active sessions | P2 | Sessions list shows device, IP, and last active time |

---

### 1.2 Gmail Integration & Email Ingestion

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| GMAIL-01 | Connect to Gmail API using stored OAuth tokens | P0 | Successful API connection; graceful handling of expired/revoked tokens |
| GMAIL-02 | Perform an **initial inbox scan** on first connect — scan the last 6 months of emails for billing receipts | P0 | System identifies and surfaces existing subscriptions from historical emails |
| GMAIL-03 | Set up **Gmail push notifications** (Pub/Sub) for real-time email monitoring | P0 | New billing emails are detected within 60 seconds of arrival |
| GMAIL-04 | Fall back to **periodic polling** (every 5 minutes) if push notifications fail | P1 | Polling activates automatically on push failure; logs the fallback event |
| GMAIL-05 | Filter emails using Gmail search queries targeting known billing senders and subject patterns | P0 | Only billing-related emails are fetched; non-billing emails are never read or stored |
| GMAIL-06 | Store only **extracted metadata** (service, amount, date) — never store full email content | P0 | No raw email body or HTML is persisted in the database |
| GMAIL-07 | Handle Gmail API rate limits gracefully with exponential backoff | P1 | System retries on 429 responses; no data loss during rate limiting |
| GMAIL-08 | Support **re-scanning** inbox on user request | P2 | User can trigger a manual rescan from settings; new subscriptions are surfaced |

---

### 1.3 Subscription Detection & Parsing Engine

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| PARSE-01 | Maintain a **known senders registry** — a curated list of billing email addresses and subject patterns for popular services (Netflix, Spotify, Amazon, etc.) | P0 | Registry covers at least 30 popular subscription services at launch |
| PARSE-02 | Extract **service name** from email sender, subject, or body | P0 | Correct service name extracted for all known services with ≥95% accuracy |
| PARSE-03 | Extract **charged amount** and **currency** from email body | P0 | Amount extracted correctly including currency symbol/code; handles ₹, $, €, £ |
| PARSE-04 | Extract **billing date** from email metadata or body content | P0 | Billing date matches the actual charge date within ±1 day |
| PARSE-05 | Detect **billing frequency** (monthly, quarterly, annual) from email patterns | P1 | Frequency correctly identified after 2+ billing cycles |
| PARSE-06 | Surface **newly detected subscriptions** for user confirmation before adding to the system | P0 | Detected subscriptions appear in a "Pending Review" queue; nothing is auto-added |
| PARSE-07 | Allow users to **manually add subscriptions** that weren't auto-detected | P1 | Manual entry form accepts: service name, amount, currency, billing date, frequency |
| PARSE-08 | Support **custom parsing rules** — users can teach the system to recognize new billing formats | P2 | User can define sender + subject pattern + amount regex for unknown services |
| PARSE-09 | Handle **multi-currency** billing emails | P1 | Amounts are stored with their original currency; conversion is display-only |

---

### 1.4 Recurring Detection Engine

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| RECUR-01 | Generate a **subscription fingerprint** based on: service name + approximate amount + billing cycle | P0 | Same subscription is matched across months with ≥98% accuracy |
| RECUR-02 | Match incoming billing emails to existing subscriptions automatically | P0 | New billing email for a known subscription updates balances without user intervention |
| RECUR-03 | Handle **price changes** — detect when a subscription amount changes and flag it for user review | P1 | Price change of >5% triggers a notification; subscription is updated after user confirms |
| RECUR-04 | Handle **billing date shifts** — recognize the same subscription even if billed on a slightly different date (±5 days) | P1 | Subscription is still matched if billing date shifts within the tolerance window |
| RECUR-05 | Detect **plan upgrades/downgrades** and prompt user to update the split | P1 | Significant price change is surfaced with a prompt to adjust split configuration |
| RECUR-06 | Detect **cancelled subscriptions** — if a subscription hasn't been billed for 2× its expected cycle, mark as possibly cancelled | P2 | Subscription is flagged as "Possibly Cancelled" with an option to archive or keep |
| RECUR-07 | Maintain a **confidence score** for each subscription match | P2 | Low-confidence matches (<80%) require user confirmation before updating balances |

---

### 1.5 Group Management

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| GRP-01 | Users can **create groups** with a name and optional description | P0 | Group is created and appears in the user's group list |
| GRP-02 | Users can **invite members** to a group via a shareable invite link | P0 | Invite link is unique per group; clicking it adds the user to the group after authentication |
| GRP-03 | Invite links should be **single-use or expirable** (configurable) | P1 | Admin can set link to expire after N uses or after a time period |
| GRP-04 | Group members can **view all subscriptions** assigned to the group | P0 | All group members see the same subscription list and their individual share |
| GRP-05 | Group **owner/admin** can add or remove members | P0 | Only admin can modify membership; removed members' pending balances are preserved |
| GRP-06 | Group admin can **transfer ownership** to another member | P2 | Ownership transfer is confirmed by both parties |
| GRP-07 | Users can **leave a group** voluntarily | P1 | Leaving user's pending balance is flagged for settlement; they're removed from future splits |
| GRP-08 | Groups support **multiple subscriptions** assigned to them | P0 | A single group can have unlimited subscriptions with different owners |
| GRP-09 | A subscription can only belong to **one group** at a time | P0 | Assigning a subscription to a new group removes it from the previous group |
| GRP-10 | Display **group-level summary** — total monthly cost, per-member share | P1 | Summary recalculates whenever a subscription is added, removed, or repriced |

---

### 1.6 Split Configuration

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| SPLIT-01 | Support **equal split** — total divided evenly among all group members | P0 | Equal split calculates to 2 decimal places; remainder assigned to owner |
| SPLIT-02 | Support **percentage-based split** — each member has a custom percentage | P1 | Percentages must sum to 100%; validation error if they don't |
| SPLIT-03 | Support **fixed-amount split** — each member pays a set amount | P1 | Fixed amounts must sum to the subscription total; validation error otherwise |
| SPLIT-04 | The subscription **owner is excluded from owing** — they paid the full amount already | P0 | Owner's balance reflects the amount others owe them, not a self-debt |
| SPLIT-05 | Allow **mid-cycle split changes** — changes apply from the next billing cycle | P1 | Current cycle balances are preserved; new split applies to next detected charge |
| SPLIT-06 | Show a **preview** of what each member will owe before confirming a split | P0 | Preview shows per-member amounts; user confirms before saving |
| SPLIT-07 | Support **excluding specific members** from individual subscriptions within a group | P2 | Excluded members don't see the subscription or get charged for it |

---

### 1.7 Balance Tracking & Settlement

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| BAL-01 | Maintain a **running balance** per user per group | P0 | Balance updates automatically when a new charge is detected |
| BAL-02 | Maintain a **running balance** per user across all groups (global view) | P0 | Dashboard shows total amount owed and total amount owed to user across all groups |
| BAL-03 | Support **net settlement** — calculate the minimum number of transactions to settle all balances within a group | P1 | Net settlement reduces N×N transactions to at most N-1 |
| BAL-04 | Members can **mark a payment as made** ("Settle Up") | P0 | Settling reduces the balance by the specified amount; both parties see the update |
| BAL-05 | Settlement requires **confirmation from the receiving party** (the subscription owner) | P1 | Balance only updates after the receiver confirms receipt |
| BAL-06 | Maintain a **settlement history** log | P0 | All settlements are logged with: amount, date, payer, receiver, method |
| BAL-07 | Support **partial settlements** — members can pay any amount, not just the full balance | P1 | Partial payment reduces balance accordingly; remaining balance is still tracked |
| BAL-08 | Show a **balance timeline** — how balances have changed over time | P2 | Visual chart showing balance trajectory per group member |

---

### 1.8 Notifications & Reminders

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| NOTIF-01 | Send notification to all group members when a **new charge is detected** | P0 | All members receive a notification within 5 minutes of charge detection |
| NOTIF-02 | Notification includes: service name, total amount, member's share, payment link | P0 | All four data points are present in every charge notification |
| NOTIF-03 | Send **payment reminders** to members who haven't settled within a configurable period (default: 3 days) | P0 | Reminder sent exactly at the configured interval; not sent if already settled |
| NOTIF-04 | Support **escalating reminders**: gentle reminder → nudge → final notice | P1 | Three escalation levels with configurable intervals (e.g., 3 days, 7 days, 14 days) |
| NOTIF-05 | Reminder frequency and escalation are **configurable by the group admin** | P1 | Admin can set intervals and disable escalation per group |
| NOTIF-06 | Support **notification channels**: in-app, email, web push | P0 | Users receive notifications on all enabled channels |
| NOTIF-07 | Users can configure **notification preferences** — opt out of specific channels or mute specific groups | P1 | Preferences are per-user and per-group; muted groups send no notifications |
| NOTIF-08 | Send a **monthly summary email** to all users with their balances across all groups | P2 | Summary sent on the 1st of each month; includes all active groups and balances |
| NOTIF-09 | **Do not send reminders** for balances below a configurable threshold (default: ₹10 / $0.50) | P2 | Micro-balances are excluded from reminder logic |

---

### 1.9 Payment Integration

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| PAY-01 | Generate **UPI deep links** for one-tap payment (India) | P0 | Tapping the link opens the user's UPI app with pre-filled amount and payee |
| PAY-02 | Generate **Venmo payment links** (US) | P1 | Link opens Venmo app/web with pre-filled amount and recipient |
| PAY-03 | Generate **PayPal.me links** (global) | P1 | Link opens PayPal payment page with pre-filled amount |
| PAY-04 | Subscription owner can configure their **preferred payment method** (UPI ID, Venmo handle, PayPal email) | P0 | Payment links are generated using the owner's configured payment info |
| PAY-05 | Include a **"Mark as Paid"** button in the notification for manual confirmation | P0 | Clicking "Mark as Paid" opens a confirmation dialog; updates balance on confirm |
| PAY-06 | Support **auto-detection of payments** via UPI/Venmo transaction emails (future) | P3 | Payment emails are matched to pending balances; auto-settlement on match |
| PAY-07 | Maintain a **payment history** per user and per group | P0 | History shows: date, amount, from, to, method, status |

---

### 1.10 Dashboard & Reporting

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| DASH-01 | **Home dashboard** shows: active subscriptions, total monthly spend, pending balances | P0 | Dashboard loads within 2 seconds; data is current as of last detected charge |
| DASH-02 | **Group view** shows: group members, assigned subscriptions, per-member balances, settle-up actions | P0 | All group data visible on one screen; settle-up CTA is prominent |
| DASH-03 | **Subscription detail view** shows: service name, amount, billing date, frequency, split breakdown, charge history | P0 | All fields populated; charge history is chronological |
| DASH-04 | **Monthly spend report** — breakdown of subscriptions by category and group | P2 | Report is auto-generated; downloadable as PDF/CSV |
| DASH-05 | **Search and filter** — filter subscriptions by group, service, amount range, status | P2 | Filters are combinable; results update in real-time |
| DASH-06 | Display a **"Pending Review"** section for newly detected subscriptions awaiting user confirmation | P0 | Pending items show service name, amount, date; user can confirm or dismiss |

---

## 2. Non-Functional Requirements

### 2.1 Performance

| ID | Requirement | Target |
|----|------------|--------|
| PERF-01 | Page load time (initial) | < 2 seconds |
| PERF-02 | API response time (95th percentile) | < 500ms |
| PERF-03 | Email detection to notification delivery | < 60 seconds |
| PERF-04 | Dashboard data freshness | Real-time (WebSocket) or < 30 seconds (polling) |
| PERF-05 | Initial inbox scan (6 months) | < 5 minutes |

### 2.2 Security

| ID | Requirement | Target |
|----|------------|--------|
| SEC-01 | OAuth tokens encrypted at rest | AES-256 |
| SEC-02 | All API endpoints authenticated | JWT with expiration |
| SEC-03 | Gmail scope limited to read-only | `gmail.readonly` only |
| SEC-04 | No raw email content stored | Only extracted metadata |
| SEC-05 | HTTPS enforced on all endpoints | TLS 1.2+ |
| SEC-06 | Rate limiting on all public endpoints | 100 req/min per user |
| SEC-07 | Input validation and sanitization | All user inputs |
| SEC-08 | CORS restricted to frontend domain | Whitelist only |

### 2.3 Scalability

| ID | Requirement | Target |
|----|------------|--------|
| SCALE-01 | Support concurrent users | 10,000 (initial target) |
| SCALE-02 | Subscriptions per user | Up to 50 |
| SCALE-03 | Groups per user | Up to 20 |
| SCALE-04 | Members per group | Up to 15 |
| SCALE-05 | Email processing throughput | 1,000 emails/minute |

### 2.4 Reliability

| ID | Requirement | Target |
|----|------------|--------|
| REL-01 | System uptime | 99.5% |
| REL-02 | Zero missed charges | All billing emails must be processed; retry on failure |
| REL-03 | Data backup frequency | Daily automated backups |
| REL-04 | Graceful degradation | System functions without push notifications (falls back to polling) |

### 2.5 Accessibility & UX

| ID | Requirement | Target |
|----|------------|--------|
| UX-01 | Mobile responsive design | Fully usable on 360px+ screens |
| UX-02 | WCAG 2.1 AA compliance | Color contrast, keyboard navigation, screen reader support |
| UX-03 | Loading states and skeleton screens | All async operations show feedback |
| UX-04 | Error messages are actionable | User-facing errors explain what to do next |
| UX-05 | Dark mode support | Full dark theme |

---

## 3. Data Models

### 3.1 Core Entities

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│    User      │──┬───▶│    Group      │◀──────│ Subscription │
│              │  │    │              │       │              │
│ id           │  │    │ id           │       │ id           │
│ email        │  │    │ name         │       │ service_name │
│ name         │  │    │ description  │       │ amount       │
│ google_id    │  │    │ invite_code  │       │ currency     │
│ oauth_token  │  │    │ created_by   │       │ frequency    │
│ created_at   │  │    │ created_at   │       │ billing_day  │
└──────┬───────┘  │    └──────────────┘       │ owner_id     │
       │          │                           │ group_id     │
       │          │    ┌──────────────┐       │ fingerprint  │
       │          └───▶│ GroupMember   │       │ status       │
       │               │              │       │ last_charged │
       │               │ user_id      │       └──────────────┘
       │               │ group_id     │
       │               │ role (admin/ │
       │               │   member)    │
       │               │ joined_at    │
       │               └──────────────┘
       │
       │          ┌──────────────┐       ┌──────────────┐
       └─────────▶│   Balance     │       │  SplitRule    │
                  │              │       │              │
                  │ id           │       │ id           │
                  │ user_id      │       │ sub_id       │
                  │ group_id     │       │ user_id      │
                  │ amount       │       │ split_type   │
                  │ updated_at   │       │ value        │
                  └──────────────┘       └──────────────┘

┌──────────────┐       ┌──────────────┐
│  ChargeEvent  │       │  Settlement   │
│              │       │              │
│ id           │       │ id           │
│ sub_id       │       │ payer_id     │
│ amount       │       │ receiver_id  │
│ detected_at  │       │ group_id     │
│ email_ref    │       │ amount       │
│ fingerprint  │       │ method       │
│ confidence   │       │ confirmed    │
└──────────────┘       │ created_at   │
                       └──────────────┘

┌──────────────┐
│ Notification  │
│              │
│ id           │
│ user_id      │
│ type         │
│ channel      │
│ payload      │
│ sent_at      │
│ read_at      │
└──────────────┘
```

### 3.2 Key Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| User → Group | Many-to-Many | Via `GroupMember` join table |
| User → Subscription | One-to-Many | User owns subscriptions (as payer) |
| Group → Subscription | One-to-Many | Subscriptions are assigned to groups |
| Subscription → SplitRule | One-to-Many | Each member's share is defined per subscription |
| Subscription → ChargeEvent | One-to-Many | Each billing cycle creates a charge event |
| User → Balance | One-to-Many | Per-group balance tracking |
| User → Settlement | One-to-Many | As payer or receiver |

---

## 4. API Requirements

### 4.1 Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/google` | Initiate Google OAuth flow |
| `GET` | `/auth/google/callback` | Handle OAuth callback, create/login user |
| `POST` | `/auth/logout` | Destroy session |
| `DELETE` | `/auth/gmail-access` | Revoke Gmail access and delete tokens |

### 4.2 Subscription Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/subscriptions` | List user's subscriptions (owned + shared) |
| `GET` | `/api/subscriptions/pending` | List auto-detected subscriptions awaiting review |
| `POST` | `/api/subscriptions` | Manually add a subscription |
| `POST` | `/api/subscriptions/:id/confirm` | Confirm a pending detected subscription |
| `PUT` | `/api/subscriptions/:id` | Update subscription details |
| `DELETE` | `/api/subscriptions/:id` | Archive/remove a subscription |
| `POST` | `/api/subscriptions/:id/assign` | Assign subscription to a group |
| `POST` | `/api/subscriptions/rescan` | Trigger inbox rescan |

### 4.3 Group Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/groups` | List user's groups |
| `POST` | `/api/groups` | Create a new group |
| `GET` | `/api/groups/:id` | Get group details, members, subscriptions |
| `PUT` | `/api/groups/:id` | Update group name/description |
| `DELETE` | `/api/groups/:id` | Delete group (admin only) |
| `POST` | `/api/groups/:id/invite` | Generate invite link |
| `POST` | `/api/groups/join/:code` | Join group via invite code |
| `DELETE` | `/api/groups/:id/members/:userId` | Remove member from group |
| `POST` | `/api/groups/:id/leave` | Leave a group |

### 4.4 Split & Balance Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/groups/:id/balances` | Get all member balances for a group |
| `GET` | `/api/balances/global` | Get user's balances across all groups |
| `PUT` | `/api/subscriptions/:id/split` | Set/update split rules for a subscription |
| `GET` | `/api/subscriptions/:id/split` | Get current split configuration |
| `POST` | `/api/settlements` | Record a settlement (settle up) |
| `POST` | `/api/settlements/:id/confirm` | Confirm receipt of a settlement |
| `GET` | `/api/groups/:id/settlements` | Get settlement history for a group |
| `GET` | `/api/groups/:id/net-settlement` | Calculate optimized net settlement |

### 4.5 Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications` | Get user's notifications (paginated) |
| `PUT` | `/api/notifications/:id/read` | Mark notification as read |
| `PUT` | `/api/notifications/preferences` | Update notification preferences |
| `GET` | `/api/notifications/preferences` | Get notification preferences |

### 4.6 Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/payments/link/:settlementId` | Generate payment deep link for a settlement |
| `PUT` | `/api/users/payment-info` | Set user's payment info (UPI ID, Venmo, PayPal) |
| `GET` | `/api/groups/:id/payment-history` | Get payment history for a group |

---

## 5. Third-Party Dependencies

| Service | Purpose | Required Credentials |
|---------|---------|---------------------|
| **Google Cloud Console** | Gmail API access, OAuth 2.0 client | Client ID, Client Secret |
| **Google Pub/Sub** | Real-time Gmail push notifications | Pub/Sub topic, service account |
| **PostgreSQL** | Primary database | Connection string |
| **SendGrid / Resend** | Transactional emails (notifications, reminders) | API key |
| **Web Push (VAPID)** | Browser push notifications | VAPID public/private key pair |
| **Vercel** | Frontend hosting | Vercel account |
| **Railway / Render** | Backend hosting | Platform account |

---

## 6. Phased Rollout

### Phase 1 — MVP (Core Loop)
> Goal: One user can connect Gmail, detect subscriptions, create a group, split a subscription, and send payment reminders.

| Module | Requirements Included |
|--------|----------------------|
| Auth | AUTH-01, AUTH-02, AUTH-03, AUTH-05 |
| Gmail | GMAIL-01, GMAIL-02, GMAIL-03, GMAIL-05, GMAIL-06 |
| Parsing | PARSE-01, PARSE-02, PARSE-03, PARSE-04, PARSE-06 |
| Recurring | RECUR-01, RECUR-02 |
| Groups | GRP-01, GRP-02, GRP-04, GRP-05, GRP-08, GRP-09 |
| Splits | SPLIT-01, SPLIT-04, SPLIT-06 |
| Balances | BAL-01, BAL-02, BAL-04, BAL-06 |
| Notifications | NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-06 |
| Payments | PAY-01, PAY-04, PAY-05, PAY-07 |
| Dashboard | DASH-01, DASH-02, DASH-03, DASH-06 |

### Phase 2 — Polish & Flexibility
> Goal: Better UX, more split options, smarter detection.

| Module | Requirements Included |
|--------|----------------------|
| Auth | AUTH-04, AUTH-06 |
| Gmail | GMAIL-04, GMAIL-07 |
| Parsing | PARSE-05, PARSE-07, PARSE-09 |
| Recurring | RECUR-03, RECUR-04, RECUR-05 |
| Groups | GRP-03, GRP-07, GRP-10 |
| Splits | SPLIT-02, SPLIT-03, SPLIT-05 |
| Balances | BAL-03, BAL-05, BAL-07 |
| Notifications | NOTIF-04, NOTIF-05, NOTIF-07 |
| Payments | PAY-02, PAY-03 |

### Phase 3 — Advanced & Scale
> Goal: Power features, analytics, and future monetization hooks.

| Module | Requirements Included |
|--------|----------------------|
| Gmail | GMAIL-08 |
| Parsing | PARSE-08 |
| Recurring | RECUR-06, RECUR-07 |
| Groups | GRP-06 |
| Splits | SPLIT-07 |
| Balances | BAL-08 |
| Notifications | NOTIF-08, NOTIF-09 |
| Payments | PAY-06 |
| Dashboard | DASH-04, DASH-05 |

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| **P0** | Must have for MVP — launch blocker |
| **P1** | Important — needed shortly after launch |
| **P2** | Nice to have — improves experience significantly |
| **P3** | Future — long-term roadmap item |
