# NavApp Backend

Express.js API server for the NavApp navigation application.

## Features

- 🔐 JWT-based authentication
- 🗺️ Mapbox API proxy (geocoding & routing)
- 📍 Address history management
- 🗄️ PostgreSQL database with Drizzle ORM

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (Supabase, Neon, or local)
- Mapbox account

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
   PORT=8080
   DATABASE_URL=postgresql://user:password@host:5432/database
   JWT_SECRET=your-super-secret-jwt-key
   MAPBOX_ACCESS_TOKEN=your_mapbox_secret_token
   FRONTEND_URL=http://localhost:3000
   ```

4. **Run database migrations**
   ```bash
   bun run db:push
   # or
   npx drizzle-kit push
   ```

5. **Start development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

   Server runs at `http://localhost:8080`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `8080`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `MAPBOX_ACCESS_TOKEN` | Mapbox secret access token |
| `FRONTEND_URL` | Frontend URL for CORS (default: `http://localhost:3000`) |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login & get token |
| GET | `/api/auth/me` | Get current user |

### Addresses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/addresses` | Get user's saved addresses |
| POST | `/api/addresses` | Save new address |
| DELETE | `/api/addresses/:id` | Delete address |

### Mapbox Proxy

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/geocode?q=query` | Search addresses |
| GET | `/api/route?startLat&startLng&endLat&endLng` | Get route |

## Project Structure

```
server/
├── index.ts        # Express app setup
├── db/
│   ├── index.ts    # Database connection
│   └── schema.ts   # Drizzle schema
└── routes/
    ├── auth.ts     # Authentication endpoints
    ├── addresses.ts # Address CRUD
    └── mapbox.ts   # Geocoding & routing proxy
```

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Addresses table
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Scripts

```bash
bun dev        # Start dev server with hot reload
bun start      # Start production server
bun db:push    # Push schema to database
bun db:studio  # Open Drizzle Studio
```

