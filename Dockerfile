# Imagen solo API (Express + Prisma + SQLite). Sin build Vite.
FROM node:20-bookworm-slim

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY server.js seed.js ./
COPY scripts ./scripts
COPY src/lib ./src/lib
COPY src/i18n ./src/i18n

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "run", "start:api"]
