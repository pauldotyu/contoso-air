# Stage 1: deps
FROM node:22-slim AS deps
WORKDIR /app
COPY src/web/package.json src/web/package-lock.json ./
RUN npm ci --no-audit --no-fund

# Stage 2: builder
FROM node:22-slim AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY src/web .
RUN npm run build

# Stage 3: runner
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
RUN groupadd -r nextjs && useradd -r -g nextjs nextjs
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
EXPOSE 3000
USER nextjs
CMD ["node", "server.js"]
