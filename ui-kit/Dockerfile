# syntax=docker/dockerfile:1.7

# ---------- Builder: install deps and build the static Storybook ----------
FROM oven/bun:1.3.11-alpine AS builder

WORKDIR /app

# Install dependencies first to leverage layer caching.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the source and build.
COPY . .
RUN bun run build-storybook

# ---------- Runtime: serve the static output via nginx ----------
FROM nginx:alpine AS runtime

# Replace the default site with our config (listens on 3000).
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/storybook.conf

# Drop the built static site into nginx's web root.
COPY --from=builder /app/storybook-static /usr/share/nginx/html

EXPOSE 3000

# nginx:alpine's default CMD already runs nginx in the foreground.
