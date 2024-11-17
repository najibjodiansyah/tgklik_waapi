# Use a lightweight Node.js image as the base
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev"]