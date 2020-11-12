const AbstractPCAPAnalyser = require('./AbstractPCAPAnalyser')

class UDPvsTCPRatio extends AbstractPCAPAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.results = {
      nrOfUDP: 0,
      nrOfTCP: 0
    }
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.pcapParser.on('tcpPacket', this.incrementTCP.bind(this))
    this.pcapParser.on('udpPacket', this.incrementUDP.bind(this))
  }

  getName () {
    return 'Ratio between UDP and TCP segments'
  }

  // Actual mining function
  incrementUDP () {
    this.results.nrOfUDP++
  }

  incrementTCP () {
    this.results.nrOfTCP++
  }

  // Post-analysis phase, do additional computation with the collected data and write it out
  async postParsingAnalysis () {
    var fileName = `${this.baseOutPath}-udp_tcp_ratio.json`
    var fileContent = {
      piechart: {
        datasets: [{
          backgroundColor: ['#DB0071', '#005FD0'],
          data: [
            this.results.nrOfUDP,
            this.results.nrOfTCP
          ]
        }],
        labels: ['UPD', 'TCP']
      }
    }
    var summary = {
      fileName: fileName,
      attackCategory: 'UDP/TCP Ratio',
      analysisName: 'UDP and TCP Ratio',
      supportedDiagrams: ['PieChart']
    }
    return await this.storeAndReturnResult(fileName, fileContent, summary)
  }
}

module.exports = UDPvsTCPRatio
