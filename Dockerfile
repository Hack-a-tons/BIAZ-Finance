FROM node:20-alpine

RUN apk add --no-cache postgresql-client bash

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN chmod +x init-db.sh

EXPOSE 23000

CMD ["sh", "-c", "./init-db.sh && npm start"]
