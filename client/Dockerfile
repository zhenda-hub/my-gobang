FROM node:16-alpine

# 设置环境变量确保正确的编码
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

WORKDIR /usr/src/app/client

COPY client/package*.json ./
RUN npm install

COPY . /usr/src/app

EXPOSE 5173

CMD ["npm", "run", "dev"] 