FROM node:latest
ARG TELEGRAM_TOKEN
ENV TELEGRAM_TOKEN=$TELEGRAM_TOKEN
RUN mkdir -p /app
WORKDIR /app
COPY . /app
RUN npm install
CMD [ "npm", "start" ]
