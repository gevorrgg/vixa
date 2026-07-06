# build frontend
FROM node:22 AS build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend .
RUN npm run build


# backend
FROM node:22

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend .

COPY --from=build /app/frontend/dist ./dist

EXPOSE 8080
CMD ["node", "src/app.js"]