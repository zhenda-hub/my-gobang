FROM node:16-alpine

WORKDIR /usr/src/app/server

RUN npm install -g nodemon

COPY server/package*.json ./

RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm install --no-cache

COPY server ./

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"] 