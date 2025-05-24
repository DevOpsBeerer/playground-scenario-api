# =============================================================================
# Multi-stage Dockerfile for DevopsBeerer API (Node.js/TypeScript)
# Optimized for security, performance, and production deployment
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build the TypeScript application
# -----------------------------------------------------------------------------
FROM docker.io/node:24-alpine AS builder

# Add metadata labels
LABEL stage=builder
LABEL description="Build stage for DevopsBeerer API TypeScript compilation"

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for TypeScript compilation)
RUN npm ci --no-audit --no-fund && \
    npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY openapi.yaml ./

# Build the TypeScript application
RUN npm run build

# Remove development dependencies to reduce image size
RUN npm prune --production

# -----------------------------------------------------------------------------
# Stage 2: Create lean production runtime image
# -----------------------------------------------------------------------------
FROM docker.io/node:24-alpine AS runtime

# Add metadata labels
LABEL maintainer="DevopsBeerer Team <no-reply@devopsbeerer.ch>"
LABEL description="DevopsBeerer API - OAuth2/OIDC Resource Server"
LABEL version="1.0.0"
LABEL org.opencontainers.image.title="DevopsBeerer API"
LABEL org.opencontainers.image.description="RESTful API demonstrating OAuth2/OIDC Bearer Token Authentication"
LABEL org.opencontainers.image.vendor="DevopsBeerer Team"
LABEL org.opencontainers.image.licenses="MIT"

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S devopsbeerer -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=devopsbeerer:nodejs /app/dist/ ./dist/
COPY --from=builder --chown=devopsbeerer:nodejs /app/openapi.yaml ./
COPY --chown=devopsbeerer:nodejs db.init.json ./

# Create data directory for lowdb files with proper permissions
RUN mkdir -p /app/data && \
    chown -R devopsbeerer:nodejs /app/data

# Copy database initialization file to data directory
COPY --chown=devopsbeerer:nodejs db.init.json /app/data/

# Switch to non-root user
USER devopsbeerer

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Health check using the built-in health endpoints
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD node -e " \
        const http = require('http'); \
        const options = { hostname: 'localhost', port: 3000, path: '/health/liveness', timeout: 5000 }; \
        const req = http.request(options, (res) => { \
            process.exit(res.statusCode === 200 ? 0 : 1); \
        }); \
        req.on('error', () => process.exit(1)); \
        req.on('timeout', () => process.exit(1)); \
        req.end();" || exit 1

# Use dumb-init to handle signals properly and start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]