FROM node:10.22.1-buster

RUN apt-get update; DEBIAN_FRONTEND=noninteractive apt-get install -y libpcap-dev python3-pip tshark;

COPY api /usr/src/app/api
COPY miner /usr/src/app/miner
COPY ddos_dissector /usr/src/app/ddos_dissector
WORKDIR /usr/src/app/ddos_dissector
COPY converters /usr/src/app/converters
WORKDIR /usr/src/app/converters
RUN pip3 install -r requirements.txt
WORKDIR /usr/src/app/miner
RUN rm -rf node_modules/ ; npm i
WORKDIR /usr/src/app/api
RUN rm -rf node_modules/ ; npm i; mkdir tmp

EXPOSE 3000

CMD [ "node", "index.js" ]
