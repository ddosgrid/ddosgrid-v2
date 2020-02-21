const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')

class IPVersionAnalyser extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.results = {
      nrOfIPv4: 0,
      nrOfIPv6: 0
    }
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.pcapParser.on('ipv4Packet', this.countIPV4.bind(this))
    this.pcapParser.on('ipv6Packet', this.countIPV6.bind(this))
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  countIPV4 () {
    this.results.nrOfIPv4++
  }

  countIPV6 () {
    this.results.nrOfIPv6++
  }

  getName () {
    return 'Analysis of IPv4 vs IPv6 traffic (based on packets)'
  }

  async postParsingAnalysis () {
    var fileName = `${this.baseOutPath}-ipversion.json`
    var fileContent = {
      piechart: {
        datasets: [{
          backgroundColor: ['#D33F49', '#77BA99'],
          data: Object.values(this.results)
        }],
        labels: ['IPv4', 'IPv6']
      }
    }
    var summary = {
      fileName: fileName,
      attackCategory: 'Network State',
      analysisName: 'IPv4 and IPv6 usage',
      supportedDiagrams: ['PieChart']
    }
    return await this.storeAndReturnResult(fileName, fileContent, summary)
  }
}

module.exports = IPVersionAnalyser
