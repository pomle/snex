FROM node:8

MAINTAINER "Pontus Alexander <pontus.alexander@gmail.com>"

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package.json yarn.lock ./
RUN yarn

COPY public/ ./public
COPY server/ ./server
COPY service.js ./

EXPOSE 8080

ENV PORT=8080

CMD ["yarn", "run", "start"]
