# StreamVibe Dockerfile for Production Deployment

FROM node:20-alpine AS builder

# Install system dependencies
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    curl \
    ffmpeg \
    postgresql-client \
    dumb-init

# Create app user
RUN addgroup -g 1001 -S streamvibe && \
    adduser -S streamvibe -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=streamvibe:streamvibe /app/dist ./dist
COPY --from=builder --chown=streamvibe:streamvibe /app/node_modules ./node_modules
COPY --from=builder --chown=streamvibe:streamvibe /app/package.json ./

# Create necessary directories
RUN mkdir -p /var/recordings /var/log/streamvibe && \
    chown -R streamvibe:streamvibe /var/recordings /var/log/streamvibe

# Switch to app user
USER streamvibe

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-5000}/api/health || exit 1

# Expose port
EXPOSE 5000

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]