FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Install dependencies needed for node-gyp and Prisma
RUN apt-get update && apt-get install -y python3 make g++ openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY apps/web/package*.json ./apps/web/

RUN npm install

COPY . .

# Generate Prisma client
WORKDIR /app/apps/server
RUN npx prisma generate

# Build frontend
WORKDIR /app/apps/web
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Start production image build
FROM node:24-bookworm-slim AS runner

WORKDIR /app

# Prisma needs openssl
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built server
COPY --from=builder /app/apps/server ./apps/server

# Copy built frontend
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/apps/web/package*.json ./apps/web/

# Create a volume directory for sqlite
RUN mkdir -p /app/data && chmod 777 /app/data

WORKDIR /app/apps/server

# USER node

EXPOSE 3000

ENV HOST_PORT=3000
# Store the database in the volume directory
ENV DATABASE_URL="file:/app/data/faction.db"

# Before starting the server, apply pending DB migrations
CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]
