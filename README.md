# Zavo

Next-generation streaming overlay and creator tools. Built for speed, customization, and seamless OBS integration.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-Private-red)

---

## ✨ Features

### **Stream Overlays**
- **Donation Alerts** – Real-time notifications with Text-to-Speech (TTS) and media sharing (YouTube videos/audio)
- **Goal Bar** – Visual donation progress tracking with fully customizable styles
- **Leaderboard** – Display top supporters with customizable rankings and design

### **Creator Dashboard**
- **Multi-Profile Support** – Create and manage multiple creator personas
- **Live Customization** – Edit overlay styles (colors, fonts, border radius) with instant preview
- **Media Share Settings** – Configure TTS minimum, cost-per-second, and max duration
- **Bank Integration** – Connect bank accounts for seamless withdrawals
- **Stream Control** – Manage goals, reset stream keys, and send test alerts

### **Donation System**
- **QRIS Payments** – Integrated with Xendit for secure Indonesian payment processing
- **Anonymous Donations** – Support for guest donations without account
- **Media Requests** – Donors can attach YouTube videos with variable pricing

### **Wallet & Withdrawals**
- **Real-time Balance** – Track earnings with ledger-based accounting
- **Withdrawal Requests** – Request payouts to registered bank accounts
- **Transaction History** – Complete audit trail of all financial activities

### **Community System**
- **Creator Communities** – Build and manage your own community
- **Member Management** – Join and participate in creator communities

### **Admin Panel**
- **User Management** – View, suspend, and ban users with admin controls
- **Withdrawal Approvals** – Review and process creator withdrawal requests
- **Platform Analytics** – Monitor platform-wide activities

### **Security**
- **Rate Limiting** – DDoS protection via Upstash Redis
- **Authentication** – Secure auth with better-auth (email/password, OAuth)
- **Role-based Access** – User and admin role separation

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 + Shadcn/Radix UI |
| **Database** | PostgreSQL + Drizzle ORM |
| **API** | tRPC |
| **Real-time** | Pusher |
| **Payments** | Xendit |
| **Auth** | better-auth |
| **Rate Limiting** | Upstash Redis |
| **State Management** | Zustand |
| **Forms** | React Hook Form + Zod |
| **Animations** | Framer Motion |
| **Charts** | Recharts |

---

## 📹 OBS Setup Guide

To ensure alerts and media autoplay without user interaction:

### 1. Add Browser Source
Create a new Browser Source in OBS and paste your overlay URL:
- **Alert Overlay**: `.../stream/overlay/[token]/alert`
- **Goal Overlay**: `.../stream/overlay/[token]/goal`
- **Leaderboard**: `.../stream/overlay/[token]/leaderboard`

### 2. Enable Autoplay

**Windows/Linux:**
1. Right-click OBS shortcut → **Properties**
2. Add to **Target** field:
   ```
   --autoplay-policy=no-user-gesture-required
   ```

**macOS:**
```bash
/Applications/OBS.app/Contents/MacOS/OBS --args --autoplay-policy=no-user-gesture-required
```

---

## 💻 Getting Started

### Prerequisites
- Node.js 20+ or Bun
- PostgreSQL database
- Pusher account
- Xendit account (for payments)
- Upstash Redis (for rate limiting)

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/ardianilyas/zavo.git
   cd zavo
   bun install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in the required environment variables:
   - `DATABASE_URL` – PostgreSQL connection string
   - `PUSHER_*` – Pusher credentials
   - `XENDIT_SECRET_KEY` – Xendit API key
   - `UPSTASH_REDIS_*` – Upstash Redis credentials

3. **Database Setup**
   ```bash
   bun drizzle-kit push
   ```

4. **Run Development Server**
   ```bash
   bun dev
   ```

5. **Visit**: [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
zavo/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard & admin pages
│   ├── (main)/            # Landing pages
│   ├── [username]/        # Public creator profile
│   ├── api/               # API routes
│   └── stream/            # Stream overlay pages
├── components/            # Shared UI components
│   ├── landing/           # Landing page components
│   └── ui/                # Shadcn UI components
├── features/              # Feature modules
│   ├── admin/             # Admin management
│   ├── auth/              # Authentication
│   ├── community/         # Community system
│   ├── creator/           # Creator profiles
│   ├── dashboard/         # Dashboard components
│   ├── donation/          # Donation handling
│   ├── goal/              # Donation goals
│   ├── stream/            # Stream overlays
│   ├── user/              # User management
│   └── wallet/            # Wallet & withdrawals
├── db/                    # Database schema
├── lib/                   # Utilities & services
├── trpc/                  # tRPC router & procedures
└── store/                 # Zustand state stores
```

---

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun build` | Build for production |
| `bun start` | Start production server |
| `bun lint` | Run ESLint |
| `bun drizzle-kit push` | Push schema to database |
| `bun drizzle-kit studio` | Open Drizzle Studio |

---

## 📄 License

This project is private and proprietary.
