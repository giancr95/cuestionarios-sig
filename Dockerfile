# ---- Build stage (instala deps + compila módulos nativos de better-sqlite3) ----
FROM node:20-bookworm-slim AS build
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# ---- Runtime stage ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

RUN useradd -r -u 1001 -g root sig \
 && mkdir -p /data \
 && chown -R sig:root /data

COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
COPY server ./server
COPY app ./app

USER sig
EXPOSE 3000

# Healthcheck para Coolify / Traefik
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/index.js"]
