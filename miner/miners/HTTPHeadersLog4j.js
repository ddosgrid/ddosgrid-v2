const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')
const analysisName = `most-used-http-endpoints`
const N = 5

class HTTPHeadersLog4j extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.results = []
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.pcapParser.on('httpHeaders', this.checkProbing.bind(this))
  }

  checkProbing (headerSummary) {
    var { headers } = headerSummary
    for (var header in headers) {
      var headerValue = headers[header]
      if (header.match('ldap') || headerValue.match('ldap')) {
        console.log(`"ldap" found in header "${header}: ${headerValue}" from: ${headerSummary.ipv4.saddr.addr.join('.')}`)
      }
    }
  }

  getName () {
    return `Find sources testing log4j strings`
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  async postParsingAnalysis () {
/*    var sortedByCount = this.sortEntriesByCount(this.results)
    var topNentries = this.getTopN(sortedByCount, N)

*/
    var fileName = `${this.baseOutPath}-${analysisName}.json`
    var fileContent = {
      results: this.results,
      hint: ''
    }
    var summary = {
      fileName: fileName,
      attackCategory: 'Application Layer',
      analysisName: 'Log4j probing',
      supportedDiagrams: ['']
    }
    return this.storeAndReturnResult(fileName, fileContent, summary)
  }

}

module.exports = HTTPHeadersLog4j
