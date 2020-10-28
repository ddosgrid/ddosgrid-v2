FROM node:10.22.1-buster

RUN apt-get update; DEBIAN_FRONTEND=noninteractive apt-get install -y libpcap-dev python3-pip tshark;

# Copy API, mount two subprojects
COPY api /usr/src/app/api
COPY miner /usr/src/app/miner
COPY ddos_dissector /usr/src/app/ddos_dissector

# Fetch dependencies of dissector subproject
WORKDIR /usr/src/app/ddos_dissector
RUN pip3 install -r requirements.txt

# Fetch dependencies of converters subproject
COPY converters /usr/src/app/converters
WORKDIR /usr/src/app/converters
RUN pip3 install -r requirements.txt

# Fetch dependencies of miner subproject
WORKDIR /usr/src/app/miner
RUN rm -rf node_modules/ ; npm i
  
# Fetch dependencies of API
WORKDIR /usr/src/app/api
RUN rm -rf node_modules/ ; npm i; mkdir -p tmp

EXPOSE 3000

CMD [ "node", "index.js" ]
