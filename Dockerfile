FROM node:16.16.0-alpine

RUN apk add --no-cache \
  sudo \
  python3 \
  g++ \
  build-base \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  musl-dev \
  giflib-dev \
  pixman-dev \
  pangomm-dev \
  libjpeg-turbo-dev \
  freetype-dev \
  fontconfig \
  ;

RUN sudo \
  fc-cache -f && \
  fc-match Arial \
  ;

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json /usr/src/bot
RUN npm install

COPY . /usr/src/bot

CMD ["npm", "start"]