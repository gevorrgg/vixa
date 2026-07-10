# frontend build
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# api gateway
FROM node:22-alpine

WORKDIR /app

COPY backend/services/api-gateway/package*.json ./
RUN npm ci --omit=dev

COPY backend/services/api-gateway/src ./src

COPY --from=frontend-build /app/frontend/dist ./dist

CMD ["node", "src/server.js"]