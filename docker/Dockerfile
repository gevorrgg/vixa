# build frontend
FROM node:22 AS build

WORKDIR /app

COPY frontend ./frontend

WORKDIR /app/frontend

RUN npm install
RUN npm run build


# backend
FROM node:22

WORKDIR /app

COPY backend ./backend

COPY --from=build /app/frontend/dist ./backend/dist

WORKDIR /app/backend

RUN npm install

EXPOSE 8080
CMD ["node", "src/app.js"]