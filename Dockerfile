# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy sources and build
COPY public ./public
COPY src ./src
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine AS runtime

# SPA-friendly nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

# Basic container healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
