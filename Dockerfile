# --- STAGE 1: Dependencias ---
FROM node:20-slim AS deps
WORKDIR /app

# En slim, a veces es necesario instalar openssl para Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

# --- STAGE 2: Build ---
FROM node:20-slim AS builder
WORKDIR /app
# Instalamos openssl también en el builder para que Prisma genere el cliente
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar el cliente de Prisma (importante para Turso/LibSQL)
RUN npx prisma generate
RUN npm run build

# --- STAGE 3: Runtime ---
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]

