FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install -g typescript

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]