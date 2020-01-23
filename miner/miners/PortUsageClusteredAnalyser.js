const AbstractPCAPAnalyser = require('./AbstractPCAPAnalyser')

class PortUsageClusteredAnalyser extends AbstractPCAPAnalyser {
    constructor(parser, outPath) {
        super(parser, outPath);
        this.results = {
        }
        this.output = {}
    }
    async setUp() {
        this.results.clusters = new Array(1024).fill(0)
        this.pcapParser.on('tcpPacket', this.countPort.bind(this))
        this.pcapParser.on('udpPacket', this.countPort.bind(this))
    }
    countPort (transportPacket) {
        if(!transportPacket) {
            return
        }
        var port = transportPacket.dport
        try {
            var index = Math.floor((port - 1) / 64)
            this.results.clusters[index] += 1
        } catch (e) {
            console.error('Unable to analyse packet', transportPacket)
        }
    }

    async postParsingAnalysis () {
        this.output.clusters = this.results.clusters
        this.output.scatterplot = this.formatForScatterplot(this.results.clusters)

        var fileName = `${this.baseOutPath}-portscan-clustered.json`
        var fileContent = this.output
        var summary = {
            fileName: fileName,
            attackCategory: 'Portscan',
            supportedDiagrams: ['Scatterplot']
        }
        return await this.storeAndReturnResult(fileName, fileContent, summary)
    }

    formatForScatterplot (buckets) {
        var scatterplotPoints = buckets.map((count, index) => {
          return { x: index * 64, y: count }
        })

        var filteredPorts = scatterplotPoints.filter((bucket) => {
          return bucket.y > 0
        })

        return filteredPorts
    }
}

module.exports = PortUsageClusteredAnalyser
