FROM node:latest

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json /usr/src/bot
RUN npm install \
  && npm run build

COPY . /usr/src/bot

CMD ["npm", "start"]