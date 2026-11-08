# ==============================================================================
# GDSL 2026 - Production Multi-Stage Dockerfile
# Optimized for high performance, minimal image size, and persistent data storage
# ==============================================================================

# STAGE 1: Build Frontend Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json ./
RUN npm install

# Copy source code and build production client dist
COPY . .
RUN npm run build

# STAGE 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package definitions and install production dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy compiled frontend and application files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/data ./data

# Ensure data directory exists and has write permissions for Excel & JSON store
RUN mkdir -p /app/data && chmod -R 777 /app/data

# Expose server port
EXPOSE 3000

# Health check to ensure zero-downtime container monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start full-stack server
CMD ["node", "server.ts"]
