FROM node:10.18.0-stretch

RUN apt-get update; apt-get install -y libpcap-dev;

COPY api /usr/src/app/api
COPY miner /usr/src/app/miner
WORKDIR /usr/src/app/miner
RUN rm -rf node_modules/ ; npm i
WORKDIR /usr/src/app/api
RUN rm -rf node_modules/ ; npm i; mkdir tmp

EXPOSE 3000

CMD [ "node", "index.js" ]
