const GenericPcapAnalyser = require('./GenericPcapAnalyser')

class SynStateAnalyser extends GenericPcapAnalyser {
    constructor(parser, outPath) {
        super(parser, outPath);
        this.results = {
        }
    }
    // Setup phase, load additional databases, setup subscriptions and signal completion
    async setUp() {
        this.pcapParser.on('tcpPacket', this.checkState.bind(this))
    }
    // Actual mining function
    checkState (transportPacket) {
        if(!transportPacket) {
            return
        }
        try {
        } catch (e) {
            console.error('Unable to analyse packet', transportPacket)
        }
    }
    // Post-analysis phase, do additional computation with the collected data and write it out
    async postParsingAnalysis() {
        // TODO compute percentages
        var fileName = `${this.baseOutPath}-synfloodanalysis.json`
        var fileContent = this.results
        var summary = {
            fileName: fileName,
            attackCategory: 'SYN-Flood'
            supportedDiagrams: ['PieChart']
        }
        return await  this.storeAndReturnResult(fileName, fileContent, summary)
    }
}

module.exports = SynStateAnalyser
