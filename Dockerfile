# syntax=docker/dockerfile:1
# Build context MUST be fashionsaas-storefront:
#   docker build -f fashionsaas-storefront/Dockerfile \
#     --build-arg API_BASE_URL=https://api.example.com/api \
#     --build-arg TRYON_API_BASE_URL=https://tryon.example.com/api \
#     -t fashionsaas-storefront:local fashionsaas-storefront

FROM node:22-alpine AS build
WORKDIR /app

ARG API_BASE_URL=https://api.fashionsaas.com/api
ARG TRYON_API_BASE_URL=https://tryon.fashionsaas.com/api

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Overwrite environment.prod.ts with the build-arg values before the production build swaps it
# in via angular.json's fileReplacements (production config only — see angular.json:34-39).
RUN printf 'export const environment = {\n  production: true,\n  apiBaseUrl: '\''%s'\'',\n  tenantSlug: '\'''\'', // Determined at runtime\n  tryOnApiBaseUrl: '\''%s'\'',\n};\n' \
    "$API_BASE_URL" "$TRYON_API_BASE_URL" > src/environments/environment.prod.ts

RUN npm run build:prod

FROM nginx:1.27-alpine AS final
COPY --from=build /app/dist/fashionsaas-storefront/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:80/ >/dev/null 2>&1 || exit 1
