const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')
const analysisName = `most-used-http-endpoints`
const N = 5

class HTTPEndpoints extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.results = []
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.pcapParser.on('httpEndpoint', this.countEndpoint.bind(this))
  }

  countEndpoint (endpoint) {
    try {
      var exists = this.results.find(item => item.endpoint === endpoint)
      if (exists) {
        exists.count++
      } else {
        this.results.push({ endpoint: endpoint, count: 1 })
      }
    } catch (e) {
    }
  }

  getName () {
    return `Top ${N} most used HTTP endpoints`
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  async postParsingAnalysis () {
    var sortedByCount = this.sortEntriesByCount(this.results)
    var topNentries = this.getTopN(sortedByCount, N)

    var fileName = `${this.baseOutPath}-${analysisName}.json`
    var fileContent = {
      // Signal and format to visualize as piechart
      piechart: {
        datasets: [{
          backgroundColor: ['#D33F49', '#77BA99', '#23FFD9', '#27B299', '#831A49'],
          data: this.pickCounts(topNentries)
        }],
        labels: this.pickEndpoints(topNentries)
      },
      hint: ''
    }
    var summary = {
      fileName: fileName,
      attackCategory: 'HTTP',
      analysisName: 'Most used HTTP endpoints',
      supportedDiagrams: ['PieChart']
    }
    return this.storeAndReturnResult(fileName, fileContent, summary)
  }

  pickCounts (elements) {
    return elements.map(entry => entry.count)
  }

  pickEndpoints (elements) {
    return elements.map(entry => entry.endpoint)
  }

  sortEntriesByCount (elements) {
    return elements.sort((a, b) => {
      if (a.count > b.count) { return -1 }
      if (a.count < b.count) { return 1 }
      return 0
    })
  }

  getTopN (elements, num) {
    return elements.slice(0, num)
  }
}

module.exports = HTTPEndpoints
