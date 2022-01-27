# DDoSGrid (V2)
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

There are two ways to use this project:
* Just running the miner through the shell as described under `Development > miner`.
* Running the api (locally or on a server) and serving the frontend through a webserver

# Development

Clone the project from github:
```
git clone git@github.com:ddosgrid/ddosgrid-v2.git
```

## miner
Enter the `miner` subproject and install the necessary dependencies. Make sure you are running Node.JS version 10 and that you lave libpcap installed. Make sure which package is appropriate for your distribution (e.g. libpcap-dev on Ubuntu).
```bash
cd miner
npm i
```
### From a packet capture file (post-mortem)
After that the miner package can be imported as an NPM module or it can be run manually through the shell. Alternatively one can use the miner as a subprocess where it will communicate over an IPC channel.
For example to run it through a shell:
```bash
node index.js pcap_path=/path/to/your/pcap-file
```
This will run the miner which will render its result to stdout:
```bash
node index.js pcap_path=/path/to/your/capture.pcap

✓ Input check completed
✓ Analysis started
✓ Setup of the following miners has completed:
	- Miscellaneous Metrics
	- Top 20 UPD/TCP ports by number of segments
	- Number of segments received over all TCP/UDP ports
	- Connection states of TCP segments
	- Analysis of IPv4 vs IPv6 traffic (based on packets)
	- Top 5 source hosts (IPv4)
	- Top 100 source hosts (IPv4)
✓ Decoding has finished, starting post-parsing analysis
✓ All miners have finished.

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

### From a network interface (continuous)
To use live packet sniffer the miner needs to be started using root privileges to access the network interface. For example:
```
sudo node index.js interface=enp5s0 --live
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
:warning: To use the OAuth2 authentication system, one would need to start the API using the development script in the `scripts` folder. This script will provide additional parameters. If you want to use the packet sniffer, make sure to start the API using root privileges.

:warning: If you want to invoke the DDoSDB export you will also need to clone the `converters` and `ddos_dissector` scripts into the root of the repository. Please follow the documentation of these repositories to set up the required dependencies.

## frontend
Enter the `frontend` subproject and run it after fetching its dependencies
```bash
npm i; npm run serve
```
This will automatically rebuild the project if a file changes. 
To use the application you will need to let it connect to an api instance.
In development mode (`npm run serve`) it will always connect to `localhost:3000`.

# Production deployment
There is no written documentation on how to deploy DDoSGrid/DDoSDB productively. A working documentation of such a configuration can be found in [ddosgrid/configuration-management](https://github.com/ddosgrid/configuration-management). That repository can be used as a 'working' documentation since all the steps required to setup all components will be shown. Alternatively, one may use the Ansible / Vagrant workflow to deploy the platform in an automated manner.
