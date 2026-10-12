# Study Compass

Study Compass is a React Native assignment built with Expo and TypeScript. A user enters a subject and the number of minutes studied. The Express API validates the input, calculates feedback, saves the session in a Supabase-hosted PostgreSQL database, and sends the saved result back to the app.

## Architecture

```text
Expo mobile app
    ↓ HTTP/JSON
Express + TypeScript API
    ↓ Supabase Data API
Supabase-hosted PostgreSQL
```

The Supabase secret key stays in `server/.env`. It is never included in the mobile app.

## One-time Supabase setup

1. Create a free Supabase project.
2. Open **SQL Editor** in the Supabase dashboard.
3. Paste and run the contents of `supabase/schema.sql`.
4. Select **Connect** at the top of the dashboard and choose the backend/server instructions.
5. Copy the `SUPABASE_URL` and `SUPABASE_SECRET_KEY` values.
6. Copy `server/.env.example` to `server/.env` and place those two values in it.

The table has Row Level Security enabled and no public policies. The private Express server uses Supabase's server SDK and a secret key to access it. Never place `SUPABASE_SECRET_KEY` in the Expo app or commit it to Git.

## Connect the mobile app to the API

Copy `.env.example` to `.env.local`. Set `EXPO_PUBLIC_API_URL` according to where the app runs:

- Physical phone: `http://YOUR_COMPUTER_IP:3000`
- Android emulator: `http://10.0.2.2:3000`
- iOS simulator: `http://localhost:3000`

Your phone and computer must be on the same Wi-Fi network. Restart Expo after changing `.env.local`.

## Run the project

Use two terminals from the project directory.

Terminal 1 — start the API:

```powershell
npm run api:dev
```

Terminal 2 — start the mobile app:

```powershell
npm start
```

Scan Expo's QR code with Expo Go. The app will load existing sessions from PostgreSQL, save new sessions, and delete saved sessions when **Clear all** is selected.

## Project map

- `App.tsx` contains the mobile screen and interaction state.
- `src/api/sessions.ts` contains calls from the app to Express.
- `src/domain/studySession.ts` contains the shared mobile data shape.
- `server/src/index.ts` defines the API endpoints and Supabase queries.
- `server/src/supabase.ts` creates a server-only Supabase admin client.
- `server/src/feedback.ts` contains the server-owned feedback rules.
- `supabase/schema.sql` creates and secures the PostgreSQL table.

## Validation commands

```powershell
npm run lint
npm run typecheck
npm run api:build
```
