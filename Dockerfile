# --- Build stage ---------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Vite bakes VITE_* env vars into the JS bundle at build time, not at
# container start — this must be supplied as a build ARG (see
# docker-compose.yml's `build.args`), not a runtime `environment:` entry.
ARG VITE_API_URL=https://api.aliffuture.com
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime stage ---------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
