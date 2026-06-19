FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the TypeScript code
RUN npm run build

EXPOSE 8080
CMD ["npm", "start"]
