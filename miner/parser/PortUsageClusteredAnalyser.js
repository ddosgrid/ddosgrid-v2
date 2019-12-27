const GenericPcapAnalyser = require('./GenericPcapAnalyser')

class PortUsageClusteredAnalyser extends GenericPcapAnalyser {
    constructor(parser, outPath) {
        super(parser, outPath);
        this.results = {
        }
        this.output = {}
    }
    async setUp() {
        this.portNumbers = require('port-numbers')
        this.results.clusters = new Array(1024).fill(0)
        this.pcapParser.on('tcpPacket', this.countPort.bind(this))
        this.pcapParser.on('udpPacket', this.countPort.bind(this))
    }
    countPort (transportPacket) {
        if(!transportPacket) {
            return
        }
        var port = transportPacket.dport
        try {
            var index = Math.floor((port - 1) / 64)
            console.log(index, port);
            console.log(this.results.clusters);
            this.results.clusters[index] += 1
        } catch (e) {
            console.error('Unable to analyse packet', transportPacket)
        }
    }

    async postParsingAnalysis() {
        this.output.clusters = this.results.clusters

        return new Promise((resolve, reject) => {
            const fs = require('fs')
            var fileName = `${this.baseOutPath}-portscan-clustered.json`
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

module.exports = PortUsageClusteredAnalyser
