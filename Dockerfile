FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run check && npm prune --omit=dev
ENV NODE_ENV=production
ENV NODE_CONFIG_DIR=./src/config
EXPOSE 3000
CMD ["node", "dist/index.js"]
