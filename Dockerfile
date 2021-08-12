FROM node:lts

ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY isr ./isr

RUN yarn install
ENV NODE_PATH=.
CMD ["node", "isr/main.js"]
