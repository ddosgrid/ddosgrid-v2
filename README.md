# DDoSGrid
> A tool for analysis and visualization of DDoS attacks from PCAP files

## Table of Contents

   * [DDoSGrid](#ddosgrid)
      * [Introduction](#introduction)
   * [Development](#development)
      * [miner](#miner)
      * [api](#api)
      * [frontend](#frontend)
   * [Production deployment](#production-deployment)
      * [frontend](#frontend-1)
      * [API](#api-1)

## Introduction

This tool consist of three parts:
* The `miner` subproject is a packet decoder and feature extractor that produces output as JSON files and communicates over stdout or an IPC channel if available.
* `api` is a RESTful api based on Express.js which orchestrates the `miner` package if required.
* The `frontend` is a Vue.js based SPA that renders visualizations obtained from the api.

# Development

Clone the project from github:
```
git clone git@github.com:ddosgrid/ddos-visualization.git
```

## miner
Enter the `miner` subproject and install the necessary dependencies. Make sure you are running Node.JS version 10 and that you lave libpcap installed.
```bash
cd miner
npm i
```
After that the miner package can be imported as an NPM module or it can be run manually through the shell. Alternatively one can use the miner as a subprocess where it will communicate over an IPC channel.
For example to run it through a shell:
```bash
node index.js pcap_path=/path/to/your/pcap-file
```
Run it as a subprocess:
```javascript
const child_process = require('child_process')
const fork = child_process.fork
const path = require('path')

// Options to run the miner as subprocess
var program = path.resolve('../miner/index.js')
var args = [ `pcap_path=${pcapPath}` ]
var options = { stdio: [ 'ipc' ] }

var childProcess = fork(program, args, options)

// Once the miner finishes he will send a 'message' with file paths
// pointing to the analysis results
childProcess.on('message', function (minerResults) {
  var parsedResults = JSON.parse(minerResults)
  // Do something with the JSON files
})
childProcess.on('exit', (code) => {
  if(code !== 0) {
    // Something went wrong
  }
})
```

## api
Setting up the api is straightforward simply fetch the dependencies and start the main javascript file. Make sure that you have previously installed the dependencies of the miner!
```bash
cd miner; npm i; cd ..;
cd api; npm i
```
Now simply run it and optionally pass the port where it should listen:
```bash
node index.js
```
or
```bash
export PORT=1234; node index.js
```

## frontend
Enter the `frontend` subproject and run it after fetching its dependencies
```
npm i; npm run serve
```
This will automatically rebuild the project if a file changes. 
To use the application you will need to let it connect to an api instance.
In development mode (`npm run serve`) it will always connect to `localhost:3000`.

# Production deployment
## frontend
Our frontend is continuosly integrated and deployed by a GitHub action to a GitHub pages branch.
If you are building manually simply run `npm run build` and then deploy the `dist` folder.
This will create a frontend that automatically connects to our hostname in production. If you want to change the hostname of the API please edit `frontend/.env.production`.

## API
Our api is continuosly integrated and built as a Docker image and pushed to that registry.
From there you can run it with one command:
```
cd api; docker-compose up
```
From there we simply pull the docker file in a 5minute time interval from Docker Hub and then redeploy the service using CRON:
```
*/5 * * * * docker pull ddosgrid/ddosgrid-api:latest; docker service update ddosgridapi_ddosgridapi --image ddosgrid/ddosgrid-api:latest
```
This docker compose file will run the API on local interface and also expose it as a TOR service. You can then connect to that onion service or place a reverse-proxy in front of the local server. With NGINX, this would look as follows:
```
server {
  listen       443 ssl;
  server_name  api.ddosgrid.online;

  # Configure max upload size
  client_max_body_size 1G;

  # Configure SSL
  ssl_certificate      /path/to/your/ssl/cert;
  ssl_certificate_key  /path/to/your/ssl/key;
  
  # Proxy to the locally running server
  location / {
    proxy_pass http://localhost:3000;
  }
}
```
Since we don't want that our server can be accessed directly without going through the proxy, we recommend blocking external access. Otherwise one could e.g. surpass the file size limit:
This would drop all packets destined to our server that are being sent from outside our host and would accept traffic to our server coming from our NGINX instance:
```
local_server_port=3000
inbound_wan_interface=eth0

iptables -I FORWARD --protocol tcp --destination-port $local_server_port -j DROP -i $inbound_wan_interface
```
