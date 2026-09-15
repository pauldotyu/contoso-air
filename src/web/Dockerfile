ARG NODE_VERSION=26
ARG APP_PORT=3000

# Stage 1: dependencies (install with npm, no Bun)
FROM node:${NODE_VERSION}-slim AS deps
WORKDIR /app
ENV NODE_ENV=development
# Leverage layer caching: only copy manifests first
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Stage 2: build
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# System deps occasionally needed for native modules (uncomment if required)
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     g++ make python3 ca-certificates openssl \
#  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure a clean build directory
RUN rm -rf .next && \
    npm run build

FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runner
ARG APP_PORT=3000
WORKDIR /app
LABEL com.azure.containerizationassist.createdby="containerization-assist"
ENV NODE_ENV=production \
    PORT=${APP_PORT} \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# Copy minimal standalone server + static assets produced by Next.js standalone output
COPY --chown=nonroot:nonroot --from=builder /app/.next/standalone ./
COPY --chown=nonroot:nonroot --from=builder /app/.next/static ./.next/static
COPY --chown=nonroot:nonroot --from=builder /app/public ./public

EXPOSE ${APP_PORT}
USER nonroot

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD ["/nodejs/bin/node", "-e", "fetch('http://localhost:' + process.env.PORT).then(r=>{if(r.status>399)process.exit(1)}).catch(()=>process.exit(1))"]

# Generated standalone output provides server.js entrypoint
CMD ["server.js"]

###############################
# Usage:
#   docker build -t contoso-air .
#   docker run -p 3000:3000 contoso-air
# For multi-arch:
#   docker buildx build --platform=linux/amd64,linux/arm64 -t yourrepo/contoso-air:latest --push .
###############################