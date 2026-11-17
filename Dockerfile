# ==============================================================================
# Full-Stack Appify Dockerfile (Next.js 16 + Android SDK + Python APK Builder)
# ==============================================================================
# Run on Railway, Render, Fly.io, Coolify, or any Linux VPS with 1-Click
# ==============================================================================

FROM node:22-bookworm-slim AS base

# Install OpenJDK 17, Python 3, and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pil \
    openjdk-17-jre-headless \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Step 1: Install dependencies
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# Step 2: Copy project files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Ensure execute permissions on Android build-tools binaries
RUN chmod +x android-sdk/build-tools/aapt* android-sdk/build-tools/zipalign android-sdk/build-tools/apksigner 2>/dev/null || true

# Step 3: Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build:standalone

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Start Next.js standalone server
CMD ["node", ".next/standalone/server.js"]
