# WhatsWay Docker Image
# Multi-stage build for optimized production image

# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY drizzle.config.ts ./
COPY components.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY client ./client
COPY server ./server
COPY shared ./shared

# Build the application
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copy necessary files
COPY server ./server
COPY shared ./shared
COPY scripts ./scripts

# Create necessary directories
RUN mkdir -p logs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Start application
CMD ["pm2-runtime", "start", "ecosystem.config.js"]