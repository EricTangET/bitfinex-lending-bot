FROM node:13.8.0-alpine

#RUN mkdir /app
WORKDIR /app

COPY package.json ./
#COPY yarn.lock ./

RUN npm install

COPY . .

EXPOSE 3001
CMD ["npm", "server"]