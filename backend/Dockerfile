# ==============================================================================
# LTTMS V1 — Production Backend Dockerfile
# Multi-stage, non-root, minimal attack surface, graceful signal handling
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Production Dependencies
# ------------------------------------------------------------------------------
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install only production dependencies deterministically
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

# Install tini for proper PID 1 signal forwarding and curl for container health probes
RUN apk add --no-cache tini curl

WORKDIR /app

# Enforce production defaults
ENV NODE_ENV=production \
    PORT=5000

# Create uploads directory and grant ownership to the unprivileged node user
RUN mkdir -p /app/uploads && chown -R node:node /app

# Copy production node_modules from dependencies stage
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules

# Copy application source code
COPY --chown=node:node package.json ./
COPY --chown=node:node app.js index.js server.js ./
COPY --chown=node:node config/ ./config/
COPY --chown=node:node controllers/ ./controllers/
COPY --chown=node:node middleware/ ./middleware/
COPY --chown=node:node migrations/ ./migrations/
COPY --chown=node:node models/ ./models/
COPY --chown=node:node routes/ ./routes/
COPY --chown=node:node services/ ./services/
COPY --chown=node:node shared/ ./shared/
COPY --chown=node:node utils/ ./utils/
COPY --chown=node:node validation/ ./validation/

# Run as non-root user for container security
USER node

# Expose backend service port
EXPOSE 5000

# Container health probe checking internal liveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Use tini to ensure SIGTERM / SIGINT signals are forwarded for graceful shutdown
ENTRYPOINT ["/sbin/tini", "--"]

# Start the modular monolith server
CMD ["node", "index.js"]
