FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

# Install typescript globally to ensure 'tsc' command is available
RUN npm install -g typescript

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
