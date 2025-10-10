FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript
RUN npx tsc

CMD ["node", "dist/index.js"]