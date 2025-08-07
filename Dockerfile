# --- Base Node image ---
FROM node:20-alpine AS base
WORKDIR /app

# --- Dependencies Layer ---
FROM base AS deps
COPY package*.json ./
RUN npm ci

# --- Build Layer ---
FROM deps AS build
COPY . .
# Rebuild esbuild for Alpine Linux
RUN npm rebuild esbuild
RUN npm run build

# --- Production Runner ---
FROM base AS runner
# Only copy necessary files (reduce image size)
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/.env ./.env

# Expose port (your app runs on 5001 based on logs)
EXPOSE 5001

# Add start command
CMD ["npm", "start"]