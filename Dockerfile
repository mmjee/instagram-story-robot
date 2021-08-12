FROM node:lts

ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY isr ./isr

RUN yarn install
CMD ["node", "isr/main.js"]
