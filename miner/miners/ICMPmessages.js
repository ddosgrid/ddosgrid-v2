const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')
const analysisName = 'ICMP_messages'
const { translateICMPCode } = require('icmp-code-resolution')

class ICMPMessages extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.results = {
      echo: 0,
      echoreply: 0,
      unreachable: 0,
      quench: 0,
      redirect: 0,
      ra: 0,
      rs: 0,
      ttl: 0
    }
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.pcapParser.on('icmpPacket', this.checkMessage.bind(this))
  }

  getName () {
    return 'Distribution of ICMP Message Types'
  }

  checkMessage (message) {
    const { type, code } = message
    if (type === 0) {
      this.results.echoreply++
    } else if (type === 8) {
      this.results.echo++
    } else if (type === 3) {
      this.results.unreachable++
    } else if (type === 5) {
      this.results.redirect++
    } else if (type === 9) {
      this.results.ra++
    } else if (type === 10) {
      this.results.rs++
    } else if (type === 11) {
      this.results.ttl++
    }
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  async postParsingAnalysis () {
    var fileName = `${this.baseOutPath}-${analysisName}.json`
    var fileContent = {
      // Signal and format to visualize as piechart
      piechart: {
        datasets: [{
          backgroundColor: ['#77BA99','#FFBA49', '#D33F49', '#23FFD9', '#392061', '#27B299', '#831A49'],
          data: [
            this.results.echo,
            this.results.echoreply,
            this.results.unreachable,
            this.results.redirect,
            this.results.ra,
            this.results.rs,
            this.results.ttl
          ]
        }],
        labels: [
          'Echo Request',
          'Echo Reply',
          'Destination Unreachable',
          'Redirect',
          'Router Advertisement',
          'Router Solicitation',
          'Time Exceeded'
        ]
      },
      hint: 'The labels of this chart have been computed using temporally sensitive data'
    }
    var summary = {
      fileName: fileName,
      attackCategory: 'Network State',
      analysisName: this.getName(),
      supportedDiagrams: ['PieChart']
    }
    return await this.storeAndReturnResult(fileName, fileContent, summary)
  }

  formatData (elements) {
    return elements.map(entry => entry.count)
  }
}

module.exports = ICMPMessages
