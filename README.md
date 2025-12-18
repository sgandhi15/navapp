# NavApp 🗺️

Real-time navigation web application with live GPS tracking, distance calculations, and ETA.

![NavApp](https://img.shields.io/badge/NavApp-Navigation-2F80ED)

## Features

- 🔐 **User Authentication** - Register, login, secure sessions
- 📍 **Live GPS Tracking** - Real-time location updates
- 🔍 **Address Search** - Autocomplete powered by Mapbox
- 🗺️ **Interactive Maps** - Route visualization with Mapbox GL
- ⏱️ **Real-time ETA** - Distance and arrival time calculations
- 📜 **Address History** - Quick access to recent destinations
- 🚗 **Driving Directions** - Optimal route calculation

## Tech Stack

| Frontend | Backend |
|----------|---------|
| React 18 | Express.js |
| TanStack Router | PostgreSQL |
| TanStack Query | Drizzle ORM |
| Mapbox GL | JWT Auth |
| Tailwind CSS | TypeScript |

## Quick Start

### Prerequisites

- Node.js 18+ or [Bun](https://bun.sh)
- PostgreSQL database ([Supabase](https://supabase.com) or [Neon](https://neon.tech) recommended)
- [Mapbox](https://mapbox.com) account (free tier)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd navapp

# Install all dependencies
bun install
cd frontend && bun install && cd ..
```

### 2. Configure Environment

**Backend** (`server/.env`):
```env
PORT=8080
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
MAPBOX_ACCESS_TOKEN=sk.xxx
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8080
VITE_MAPBOX_TOKEN=pk.xxx
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### 3. Setup Database

```bash
bun run db:push
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
bun dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && bun dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## Project Structure

```
navapp/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── routes/     # Pages
│   │   ├── hooks/      # Custom hooks
│   │   ├── components/ # UI components
│   │   └── lib/        # Utilities
│   └── public/         # Static assets
│
├── server/             # Express backend
│   ├── db/             # Database schema
│   └── routes/         # API endpoints
│
└── drizzle.config.ts   # Database config
```

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Login |
| `/api/auth/me` | GET | Get current user |
| `/api/addresses` | GET | List saved addresses |
| `/api/addresses` | POST | Save address |
| `/api/geocode` | GET | Search addresses |
| `/api/route` | GET | Get driving route |

## Screenshots

*Add your screenshots here*

## License

MIT
