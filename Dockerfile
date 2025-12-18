# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package.json frontend/bun.lock* frontend/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Build stage for backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY package.json bun.lock* package-lock.json* ./

# Install dependencies
RUN npm install

# Copy backend source
COPY server/ ./server/
COPY tsconfig.json drizzle.config.ts ./

# Build backend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy backend build and dependencies
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package.json ./

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/server/index.js"]

