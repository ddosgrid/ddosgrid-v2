const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')
const analysisName = 'TBD'

class SourceHostsAnalyser extends AbstractPcapAnalyser {
    constructor(parser, outPath) {
        super(parser, outPath);
        this.results = [
          // store interim results here
          // { addr: '1.2.3.4', count: 1 }
        ]
    }

    // Setup phase, load additional databases, setup subscriptions and signal completion
    async setUp () {
        this.pcapParser.on('ipv4Packet', this.countIPv4Address.bind(this))
    }

    countIPv4Address (ipv4Packet) {
      var srcAddress = ipv4Packet.saddr.addr.join('.')
      var existingEntry = this.results.find(item => item.addr === srcAddress)

      if(existingEntry) {
        existingEntry.count++
      } else {
        this.results.push({ addr: srcAddress, count: 1 })
      }
    }

    // Actual mining function
    // Post-analysis phase, do additional computation with the collected data and write it out
    async postParsingAnalysis() {
        var fileName = `${this.baseOutPath}-${analysisName}.json`
        var fileContent = {
          // Signal and format to visualize as piechart
          piechart: {
            datasets: [{
              backgroundColor: [],
              data: Object.values(this.results.map(entry => entry.count))
            }],
            labels: []
          }
        }
        var summary = {
            fileName: fileName,
            attackCategory: 'TBD',
            analysisName: 'TBD',
            supportedDiagrams: ['PieChart']
        }
        return await this.storeAndReturnResult(fileName, fileContent, summary)
    }
}

module.exports = SourceHostsAnalyser
