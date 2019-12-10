class GenericPcapAnalyser {
    constructor (pcapParser, baseOutPath) {
        this.pcapParser = pcapParser
        this.baseOutPath = baseOutPath
    }
    setParser (pcapParser) {
        this.pcapParser = pcapParser
    }
    // Here one should setUp all dependencies needed for analysis this involves
    // stuff like connecting to a DB and subscribing to the parser.
    async setUp() {
    }
    async postParsingAnalysis() {
    }
}


module.exports = GenericPcapAnalyser