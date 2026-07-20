FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY client/package*.json ./client/
RUN cd client && npm ci

COPY . .
RUN cd client && npm run build

EXPOSE 3001

CMD ["node", "server/index.js"]
