# ==============================================================================
# LTTMS Frontend Dockerfile — Multi-Stage Build
# Supports production runtime, local dev bind mounts, and standalone builds
# ==============================================================================

# 1. Base Node runtime
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat wget

# 2. Dependencies installation stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 3. Development stage for live reloading
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "dev"]

# 4. Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NEXT_STANDALONE=1
ENV NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
ENV NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
RUN npm run build

# 5. Production Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Create dedicated unprivileged user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set up standalone server output with optimal permissions
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "server.js"]
