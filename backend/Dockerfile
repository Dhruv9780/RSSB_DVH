FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm run prisma:generate
RUN npm run build

COPY docker-entrypoint.sh ./docker-entrypoint.sh

EXPOSE 4000
CMD ["sh", "./docker-entrypoint.sh"]
