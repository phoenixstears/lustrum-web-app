FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci
RUN chmod -R a+x node_modules/.bin node_modules/typescript/bin

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]