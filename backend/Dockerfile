FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY prisma ./prisma
COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
