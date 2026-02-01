# Zavo

Next-generation streaming overlay and creator tools. Built for speed, customization, and seamless OBS integration.

## 🚀 Features

### **Interactive Overlays**
- **Donation Alerts**: Real-time alerts with Text-to-Speech (TTS) and Media Sharing (video/audio).
- **Goal Bar**: Visual progress tracking for donation goals. Fully customizable colors and styles.
- **Leaderboard**: Displays top supporters for the month. Customizable title, rank colors, and design.
- **Unified Theme**: All overlays enforce a clean, modern light theme.

### **Creator Dashboard**
- **Live Customization**: Edit overlay styles (colors, border radius, fonts) with instant preview.
- **Stream Control**: Manage active goals, reset stream keys, and send test alerts.
- **Multi-Profile**: Create and manage up to 2 distinct creator personas.

### **Public Pages**
- **Direct Support**: specific creators at `zavo.app/[username]`.
- **Media Share**: Variable cost-per-second settings for media requests.
- **Secure Payments**: Integrated with Xendit for reliable payment processing.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: PostgreSQL + Drizzle ORM
- **Real-time**: Pusher
- **Payments**: Xendit

---

## 📹 OBS Setup Guide (Critical)

To ensure your alerts and media play automatically without interaction (required by modern browser policies):

1. **Add Browser Source**: Create a new Browser Source in OBS and paste your overlay URL.
    - Alert Overlay: `.../stream/overlay/[token]/alert`
    - Goal Overlay: `.../stream/overlay/[token]/goal`
    - Leaderboard: `.../stream/overlay/[token]/leaderboard`

2. **Enable Autoplay**:
   - Right-click your OBS Studio shortcut and select **Properties**.
   - In the **Target** field, add this flag to the end:
     ```
     --autoplay-policy=no-user-gesture-required
     ```
   - **Mac Users**: Launch via Terminal:
     ```bash
     /Applications/OBS.app/Contents/MacOS/OBS --args --autoplay-policy=no-user-gesture-required
     ```

---

## 💻 Getting Started

1. **Clone & Install**:
   ```bash
   git clone https://github.com/ardianilyas/zavo.git
   cd zavo
   bun install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Fill in DATABASE_URL, PUSHER_*, and XENDIT_SECRET_KEY
   ```

3. **Run Development Server**:
   ```bash
   bun dev
   ```

4. **Visit**: [http://localhost:3000](http://localhost:3000)
