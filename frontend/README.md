# NavApp Frontend

Real-time navigation web app built with React, TanStack Router, and Mapbox.

## Features

- 🗺️ Interactive maps with Mapbox GL
- 📍 Real-time GPS location tracking
- 🔍 Address search with autocomplete
- ⏱️ Live distance and ETA calculations
- 📜 Address history
- 🔐 User authentication

## Tech Stack

- **React 18** - UI library
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching & caching
- **Mapbox GL** - Interactive maps
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Prerequisites

- Node.js 18+ or Bun
- Mapbox account (free tier works)
- Running backend server

## Setup

1. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   ```env
   VITE_API_URL=http://localhost:8080
   VITE_MAPBOX_TOKEN=your_mapbox_public_token
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

   App runs at `http://localhost:3000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: `http://localhost:8080`) |
| `VITE_MAPBOX_TOKEN` | Mapbox public access token |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
│   ├── useAuth.ts
│   ├── useGeolocation.ts
│   ├── useAddresses.ts
│   ├── useGeocode.ts
│   └── useRoute.ts
├── lib/            # Utilities & API client
├── routes/         # Page components (TanStack Router)
│   ├── index.tsx   # Landing page
│   ├── login.tsx   # Authentication
│   ├── home.tsx    # Destination entry
│   └── navigate.tsx # Navigation/map view
└── styles.css      # Global styles
```

## Scripts

```bash
bun dev       # Start dev server
bun build     # Build for production
bun preview   # Preview production build
```
