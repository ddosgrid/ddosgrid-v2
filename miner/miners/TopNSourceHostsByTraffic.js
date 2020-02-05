const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')
const analysisName = 'top-5-source-hosts-by-traffic'
const N = 5

class SourceHostsAnalyser extends AbstractPcapAnalyser {
    constructor(parser, outPath) {
        super(parser, outPath);
        this.results = [
          // store interim results here
          // { addr: '1.2.3.4', count: 1 }
        ]
    }

    // Setup phase, load additional databases, setup subscriptions and signal completion
    async setUp () {
        this.pcapParser.on('ipv4Packet', this.countIPv4Address.bind(this))
    }

    countIPv4Address (ipv4Packet) {
      var srcAddress = ipv4Packet.saddr.addr.join('.')
      var existingEntry = this.results.find(item => item.addr === srcAddress)

      if(existingEntry) {
        existingEntry.count++
      } else {
        this.results.push({ addr: srcAddress, count: 1 })
      }
    }

    // Actual mining function
    // Post-analysis phase, do additional computation with the collected data and write it out
    async postParsingAnalysis() {
        var sortedByCount = this.sortEntriesByCount(this.results)
        var topNentries = this.getTopN(this.results, N)

        var fileName = `${this.baseOutPath}-${analysisName}.json`
        var fileContent = {
          // Signal and format to visualize as piechart
          piechart: {
            datasets: [{
              backgroundColor: ['#D33F49',  '#77BA99', '#23FFD9','#27B299', '#831A49',],
              data: this.formatData(topNentries)
            }],
            labels: this.formatLabels(topNentries)
          }
        }
        var summary = {
            fileName: fileName,
            attackCategory: 'Network State',
            analysisName: 'Top 5 sources by traffic',
            supportedDiagrams: ['PieChart']
        }
        return await this.storeAndReturnResult(fileName, fileContent, summary)
    }

    formatData (elements) {
      return elements.map(entry => entry.count)
    }

    formatLabels (elements) {
      return elements.map(entry => entry.addr)
    }

    sortEntriesByCount (elements) {
        elements.sort((a, b) => {
            if (a.count > b.count)
                return -1;
            if (a.count < b.count)
                return 1;
            return 0;
        })
    }
    
    getTopN (elements, num) {
        return elements.slice(0, num)
    }
}

module.exports = SourceHostsAnalyser
