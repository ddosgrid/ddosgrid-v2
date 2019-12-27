const GenericPcapAnalyser = require('./GenericPcapAnalyser')

class MetricAnalyser extends GenericPcapAnalyser {
    constructor(parser, outPath) {
        super(parser, outPath);
        this.results = {
        }
        this.output = {}
    }
    async setUp() {
      this.pcapParser.on('firstPcapPacket', this.noteStartTime.bind(this))
      this.pcapParser.on('lastPcapPacket', this.noteEndTime.bind(this))
    }
    noteStartTime (pcapPacket) {
      this.output.start = pcapPacket.pcap_header.tv_sec
    }
    noteEndTime (pcapPacket) {
      this.output.end = pcapPacket.pcap_header.tv_sec
    }
    async postParsingAnalysis() {
        return new Promise((resolve, reject) => {
            const fs = require('fs')
            var fileName = `${this.baseOutPath}-generic-metrics.json`
            var outputToStore = this.output
            fs.writeFile(fileName, JSON.stringify(outputToStore), function (err) {
                if(err) {
                    console.err(`Error writing file ${fileName}.`)
                    reject(err)
                }
                resolve({
                  fileName: fileName,
                  metrics: outputToStore
                })
                }
            )
        })
    }

    writeToFile () {
        const fs = require('fs')
        var fileName = `${this.baseOutPath}-portscan.json`
        fs.writeFile(fileName, JSON.stringify(this.results), function (err) {
            if(err) {
                console.err(`Error writing file ${fileName}.`)
            }
            }
        )
    }
}

module.exports = MetricAnalyser
