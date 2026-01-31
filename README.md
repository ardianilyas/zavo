# Zavo

Next-generation streaming overlay and creator tools.

## Features

- **Real-time Leaderboard**: Beautiful, opaque, and modern leaderboard widget that updates instantly as donations come in.
- **Stream Alerts**: Instant alerts for donations with Text-to-Speech (TTS) and media sharing capabilities.
- **Autoplay Ready**: Optimized for OBS compatibility with robust media handling.

## OBS Setup Guide (Critical)

To ensure your alerts and media play automatically without interaction (which is required by modern browser policies), follow these steps:

1. **Add Browser Source**: Create a new Browser Source in OBS and paste your overlay URL.
2. **Enable Autoplay**:
   - By default, browsers (and OBS's embedded browser) block audio autoplay until a user interacts with the page.
   - To bypass this in OBS, you need to launch OBS with a specific flag.
   - Right-click your OBS Studio shortcut and select **Properties**.
   - In the **Target** field, add this to the very end (after the quotes):
     ```
     --autoplay-policy=no-user-gesture-required
     ```
   - Example (Windows): `"C:\Program Files\obs-studio\bin\64bit\obs64.exe" --autoplay-policy=no-user-gesture-required`
   - Example (Mac): Open Terminal and run `/Applications/OBS.app/Contents/MacOS/OBS --args --autoplay-policy=no-user-gesture-required` (or create an Automator script).
   - This ensures your alerts play with sound instantly!

## Getting Started

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Fill in your environment variables (Pusher credentials, Database URL, etc.).
3. Run the development server:
   ```bash
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
