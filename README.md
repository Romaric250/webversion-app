# SignNova Web

Web version of the SignNova sign language translation app. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: Login and signup with the existing SignNova API
- **Home**: Dashboard with quick actions (Live Captions, Speech to Sign, Learning)
- **Translate**: Text-to-sign translation (placeholder for avatar output)
- **Learning**: Course catalog with progress tracking
- **Dictionary**: Searchable sign language dictionary with categories
- **Profile**: User profile and settings

## Theme

Matches the SignNova mobile app theme:
- Primary: `#38E078` (green)
- Background: `#122117` (dark green)
- Surface: `#1A2E23`, `#243D2E`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://signova-backend.onrender.com/api
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

The app runs on http://localhost:3002

## API

Uses the same backend as the mobile app:
- Auth: `/api/auth/login`, `/api/auth/signup`, `/api/auth/logout`, `/api/auth/session`
- Signs: `/api/signs`, `/api/signs/search`
- Translate: `/api/translate/text-to-sign`
- Progress: `/api/progress`
