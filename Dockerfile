FROM node:13.8.0-alpine

RUN mkdir /app
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 5000
CMD ["yarn", "server"]