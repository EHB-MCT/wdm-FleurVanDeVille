FROM node:latest

WORKDIR /usr/app

COPY package*.json .

RUN npm install --quit

COPY ./ ./

EXPOSE 5174

CMD ["npm", "start"]