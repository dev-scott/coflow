# ── Stage 1: Build ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/
COPY packages/types/package.json ./packages/types/

RUN npm install --workspaces --include-workspace-root

COPY backend/ ./backend/
COPY packages/types/ ./packages/types/

WORKDIR /app/backend
RUN npm run build

# ── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]
