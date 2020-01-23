const AbstractPCAPAnalyser = require('./AbstractPCAPAnalyser')

class TopTwentyPortsAnalyser extends AbstractPCAPAnalyser {
    constructor(parser, outPath) {
        super(parser, outPath);
        this.results = {
        }
        this.output = {}
    }
    async setUp() {
        this.portNumbers = require('port-numbers')
        this.pcapParser.on('tcpPacket', this.countPort.bind(this))
        this.pcapParser.on('udpPacket', this.countPort.bind(this))
    }
    countPort (transportPacket) {
        if(!transportPacket) {
            return
        }
        var port = transportPacket.dport
        try {
            if (this.results.hasOwnProperty(port)) {
                this.results [port].count++
            } else {
                this.results[port] = {
                    count: 1,
                    port: port,
                    servicename: 'TBD'
                }
            }
        } catch (e) {
            console.error('Unable to analyse packet', transportPacket)
        }
    }

    async postParsingAnalysis() {
        var ports = Object.values(this.results)
        ports.sort((a, b) => {
            if (a.count > b.count)
                return -1;
            if (a.count < b.count)
                return 1;
            return 0;
        })

        var topTwentyServices = ports.slice(0, 20)
        topTwentyServices.map((port) => {
          var service = this.portNumbers.getService(port.port)
          try {
            port.servicename = service.name
          } catch (e) {
            port.servicename = port.port
          }
        })

        var totalNrOfDestinationPorts = ports.length
        this.output.topTwenty = topTwentyServices
        this.output.metrics = { total_dst_port: totalNrOfDestinationPorts }
        this.output.barchart = this.formatForBarchart(this.output)

        var fileName = `${this.baseOutPath}-top20Services.json`
        var fileContent = this.output
        var summary = {
            fileName: fileName,
            attackCategory: 'Portscan',
            supportedDiagrams: ['BarChart']
        }
        return await  this.storeAndReturnResult(fileName, fileContent, summary)
    }
    formatForBarchart (output) {
      return {
        labels: output.topTwenty.map(item => item.port),
        datasets: [{
           label: 'Count',
           backgroundColor: '#f87979',
           data: output.topTwenty.map(item => item.count)
        }]
      }
   }
}

module.exports = TopTwentyPortsAnalyser
