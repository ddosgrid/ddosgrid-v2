const GenericPcapAnalyser = require('./GenericPcapAnalyser')

class SynStateAnalyser extends GenericPcapAnalyser {
    constructor(parser, outPath) {
        super(parser, outPath);
        this.results = {
            nrOfPacketsInSynState: 0,
            nrOfPacketsInSynAckState: 0,
            nrOfPacketsInFinState: 0,
            nrOfPacketsInFinAckState: 0,
            nrOfPacketsInRemainingStates: 0,
            nrOfTransportPackets: 0
        }
    }
    // Setup phase, load additional databases, setup subscriptions and signal completion
    async setUp() {
        this.pcapParser.on('tcpPacket', this.checkState.bind(this))
    }
    // Actual mining function
    checkState (transportPacket) {
        this.results.nrOfTransportPackets++
        if(!transportPacket) {
            return
        }
        try {
            var syn = transportPacket.flags.syn
            var ack = transportPacket.flags.ack
            var fin = transportPacket.flags.fin
            if(syn && !ack) {
              this.results.nrOfPacketsInSynState++
            } else if (syn && ack) {
              this.results.nrOfPacketsInSynAckState++
            } else if (fin && !ack) {
              this.results.nrOfPacketsInFinState++
            } else if (fin && ack) {
              this.results.nrOfPacketsInFinAckState++
            } else {
              this.results.nrOfPacketsInRemainingStates++
            }
        } catch (e) {
            console.error('Unable to analyse packet', transportPacket)
        }
    }
    // Post-analysis phase, do additional computation with the collected data and write it out
    async postParsingAnalysis() {
        console.log('Packets in SYN state:', this.results.nrOfPacketsInSynState / this.results.nrOfTransportPackets * 100)
        console.log('Packets in SYN/ACK state:', this.results.nrOfPacketsInSynAckState / this.results.nrOfTransportPackets * 100)
        console.log('Packets in FIN state:', this.results.nrOfPacketsInFinState / this.results.nrOfTransportPackets * 100)
        console.log('Packets in FIN/ACK state:', this.results.nrOfPacketsInFinAckState / this.results.nrOfTransportPackets * 100)
        console.log('Packets presumable in established state:', this.results.nrOfPacketsInRemainingStates / this.results.nrOfTransportPackets * 100)
        var fileName = `${this.baseOutPath}-synfloodanalysis.json`
        var fileContent = {
            data: {
              syn: this.results.nrOfPacketsInSynState,
              synack: this.results.nrOfPacketsInSynAckState,
              fin: this.results.nrOfPacketsInFinState,
              finack: this.results.nrOfPacketsInFinAckState,
              other: this.results.nrOfPacketsInRemainingStates
            },
            labels: [ 'SYN', 'SYN/ACK', 'FIN', 'FIN/ACK', 'Other' ]
        }
        fileContent.piechart = this.formatForPiechart(fileContent)
        var summary = {
            fileName: fileName,
            attackCategory: 'SYN-Flood',
            supportedDiagrams: ['PieChart']
        }
        return await  this.storeAndReturnResult(fileName, fileContent, summary)
    }
    formatForPiechart (results) {
      return {
        datasets: [{
          backgroundColor: ['#DB0071',  '#005FD0', '#b967ff', '#fffb96', '#05ffa1'],
          vals: Object.values(results.data)
        }],
        labels: results.labels
      }
    }
}

module.exports = SynStateAnalyser
