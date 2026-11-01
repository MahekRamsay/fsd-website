# frontend/Dockerfile – multi-stage: Node build → nginx:alpine serve
# Stage 1: build
FROM node:20-alpine AS builder

WORKDIR /app

# Accept the API URL as a build argument so Vite can embed it
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: serve the built files with nginx
FROM nginx:alpine

# SPA fallback config so React Router works on hard-reload
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the Vite build output into the nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
