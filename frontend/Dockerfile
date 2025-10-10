FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Build the Vite app for production
RUN npm run build

# Use a lightweight server to serve static files
# (Vite preview is fine for local dev, or you can use nginx)
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "5173"]