const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')
const analysisName = `most-used-http-verbs`

class HTTPVerbs extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.results = {
      'GET': 0,
      'POST': 0,
      'HEAD': 0,
      'PUT': 0,
      'DELETE': 0,
      'CONNECT': 0,
      'OPTIONS': 0,
      'TRACE': 0,
      'PATCH': 0
    }
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.pcapParser.on('httpVerb', this.countVerb.bind(this))
  }

  countVerb (verb) {
    try {
      this.results[verb]++
    } catch (e) {
    }
  }

  getName () {
    return `Most used HTTP verbs`
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  async postParsingAnalysis () {
    var fileName = `${this.baseOutPath}-${analysisName}.json`
    var fileContent = {
      // Signal and format to visualize as piechart
      piechart: {
        datasets: [{
          backgroundColor: ['#D33F49', '#77BA99', '#23FFD9', '#27B299', '#831A49'],
          data: Object.values(this.results)
        }],
        labels: Object.keys(this.results)
      },
      hint: 'The labels of this chart have been computed using temporally sensitive data'
    }
    var summary = {
      fileName: fileName,
      attackCategory: 'Application Layer',
      analysisName: `Most used HTTP verbs`,
      supportedDiagrams: ['PieChart']
    }
    return await this.storeAndReturnResult(fileName, fileContent, summary)
  }

  formatData (elements) {
    return elements.map(entry => entry.count)
  }

  async formatLabelsForPieChart (elements) {

  }
}

module.exports = HTTPVerbs
