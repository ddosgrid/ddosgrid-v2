const GenericPcapAnalyser = require('./GenericPcapAnalyser')

class TopTwentyPortsAnalyser extends GenericPcapAnalyser {
    constructor(parser, outPath) {
        super(parser, outPath);
        this.results = {
        }
        this.output = {}
    }
    async setUp() {
        this.portNumbers = require('port-numbers')
        this.pcapParser.on('tcpPacket', this.countPort.bind(this))
        this.pcapParser.on('udpPacket', this.countPort.bind(this))
    }
    countPort (transportPacket) {
        if(!transportPacket) {
            return
        }
        var port = transportPacket.dport
        try {
            if (this.results.hasOwnProperty(port)) {
                this.results [port].count++
            } else {
                this.results[port] = {
                    count: 1,
                    port: port,
                    servicename: 'TBD'
                }
            }
        } catch (e) {
            console.error('Unable to analyse packet', transportPacket)
        }
    }

    async postParsingAnalysis() {
        var ports = Object.values(this.results)
        ports.sort((a, b) => {
            if (a.count > b.count)
                return -1;
            if (a.count < b.count)
                return 1;
            return 0;
        })
        var topTenServices = ports.slice(0, 20)
        // TODO implement fetching service name
        /*
        var service = this.portNumbers.getService(port)
        var serviceName = service.name

         */

        var totalNrOfDestinationPorts = ports.length
        this.output.topTen = topTenServices
        this.output.metrics = { total_dst_port: totalNrOfDestinationPorts }
        this.output.countedPorts = ports
        return new Promise((resolve, reject) => {
            const fs = require('fs')
            var fileName = `${this.baseOutPath}-top20.json`
            fs.writeFile(fileName, JSON.stringify(this.output), function (err) {
                if(err) {
                    console.err(`Error writing file ${fileName}.`)
                    reject(err)
                }
                resolve(fileName)
                }
            )
        })
    }
}

module.exports = TopTwentyPortsAnalyser
