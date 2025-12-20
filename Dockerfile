# Build frontend
FROM oven/bun:1 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock* ./
RUN bun install
COPY frontend/ ./
ARG VITE_API_URL
ARG VITE_MAPBOX_TOKEN
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
RUN bun run build

# Build backend
FROM oven/bun:1 AS backend-builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY server/ ./server/
COPY drizzle.config.ts ./

# Production
FROM oven/bun:1-slim
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/server ./server
COPY --from=backend-builder /app/package.json ./

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["bun", "run", "server/index.ts"]
