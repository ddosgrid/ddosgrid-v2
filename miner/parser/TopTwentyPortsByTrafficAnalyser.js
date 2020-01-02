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

        var topTwentyServices = ports.slice(0, 20)
        topTwentyServices.map((port) => {
          var service = this.portNumbers.getService(port.port)
          try {
            port.servicename = service.name
          } catch (e) {
            port.servicename = port.port
          }
        })

        var totalNrOfDestinationPorts = ports.length
        this.output.topTwenty = topTwentyServices
        this.output.metrics = { total_dst_port: totalNrOfDestinationPorts }

        return new Promise((resolve, reject) => {
            const fs = require('fs')
            var fileName = `${this.baseOutPath}-top20Services.json`
            fs.writeFile(fileName, JSON.stringify(this.output), function (err) {
                if(err) {
                    console.err(`Error writing file ${fileName}.`)
                    reject(err)
                }
                resolve({
                  fileName: fileName,
                  attackCategory: 'Portscan',
                  supportedDiagrams: ['BarChart']
                })
              }
            )
        })
    }
}

module.exports = TopTwentyPortsAnalyser
