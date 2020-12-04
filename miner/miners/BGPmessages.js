const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')
const analysisName = 'BGP_messages'

class BGPMessages extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.results = {
      Update: 0,
      Open: 0,
      Keepalive: 0,
      Notification: 0
    }
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.pcapParser.on('bgpPacket', this.checkMessage.bind(this))
  }

  getName () {
    return 'Distribution of BGP Message Types'
      this.withdrawnroutes = [ ]}

  checkMessage (message) {
    this.results[message.messageType]++
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  async postParsingAnalysis () {
    var fileName = `${this.baseOutPath}-${analysisName}.json`
    var fileContent = {
      // Signal and format to visualize as piechart
      piechart: {
        datasets: [{
          backgroundColor: ['#77BA99','#FFBA49', '#D33F49', '#23FFD9'],
          data: [
            this.results.Open,
            this.results.Keepalive,
            this.results.Update,
            this.results.Notification
          ]
        }],
        labels: [
          'Open',
          'Keepalive',
          'Update',
          'Notification'
        ]
      },
      hint: ''
    }
    var summary = {
      fileName: fileName,
      attackCategory: 'Application Layer',
      analysisName: this.getName(),
      supportedDiagrams: ['PieChart']
    }
    return await this.storeAndReturnResult(fileName, fileContent, summary)
  }
}

module.exports = BGPMessages
