const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')
const analysisName = 'BGP_messages'
var bgpdec = require('../../node_pcap/decode/bgp')

class BGPMessages extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.results = []
    this.conversations = []
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.pcapParser.on('ipv4Packet', this.checkMessage.bind(this))
    this.decoder = new bgpdec()
  }

  getName () {
    return 'BGP Messages'
  }

  checkMessage (ipv4pack) {
    try {
      var isBGP = ipv4pack.payload.dport === 179 || ipv4pack.payload.sport === 179
      if(isBGP) {
        var tcpData = ipv4pack.payload.data
        if (tcpData) {
          var bgpMessages = this.decoder.decode(tcpData, 0)
          for (var message of bgpMessages) {
            var srcAddr = ipv4pack.saddr.addr.join('.')
            var dstAddr = ipv4pack.daddr.addr.join('.')
/*            this.results.push({
              saddr: srcAddr,
              daddr: dstAddr,
              messageType: message.messageType,
              message: message.message
            })*/
            var start = this.results.length * 1000
            this.results.push([
              srcAddr,
              message.messageType,
              message.message.toString(),
              start,
              start + 1000
            ])
            var conversationPartnersKnown = this.conversations.some(function checkConversation (conversation) {
              var isKnown = conversation[0] === srcAddr && conversation[1] === dstAddr
                            || conversation[0] === dstAddr && conversation[1] === srcAddr
              return isKnown
            })
            if(!conversationPartnersKnown) {
              this.conversations.push([srcAddr, dstAddr])
            }
          }
        }
        console.log(decoded)
      }
    } catch (e) {

    }
    /*if(messages && messages.length > 0) {
      for (var message of messages) {
        this.results[message.messageType] = message.message
      }
    }
     */
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  async postParsingAnalysis () {
    var fileName = `${this.baseOutPath}-${analysisName}.json`
    var fileContent = {
      // Signal and format to visualize as piechart
      timeline: this.results,
      hint: ''
    }
    var summary = {
      fileName: fileName,
      attackCategory: 'Application Layer',
      analysisName: this.getName(),
      supportedDiagrams: ['Timeline']
    }
    return await this.storeAndReturnResult(fileName, fileContent, summary)
  }
}

module.exports = BGPMessages
