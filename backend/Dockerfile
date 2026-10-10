FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling in container environments
RUN apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Default port
ENV PORT=5000
EXPOSE 5000

# Healthcheck instruction inside container
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/server.js"]
