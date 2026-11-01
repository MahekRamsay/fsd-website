# backend/Dockerfile – node:20-alpine, production deps only
FROM node:20-alpine

WORKDIR /app

# Copy package files first so Docker caches the install layer
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY src/ ./src/

EXPOSE 5000

CMD ["node", "src/server.js"]
