const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')
const analysisName = 'TBD'

class SourceHostsAnalyser extends AbstractPcapAnalyser {
    constructor(parser, outPath) {
        super(parser, outPath);
        this.results = {
          // store interim results here
        }
    }

    // Setup phase, load additional databases, setup subscriptions and signal completion
    async setUp() {
    }

    // Actual mining function
    // Post-analysis phase, do additional computation with the collected data and write it out
    async postParsingAnalysis() {

        var fileName = `${this.baseOutPath}-${analysisName}.json`
        var fileContent = {
          // Signal and format to visualize as piechart
          piechart: {
            datasets: [{
              backgroundColor: [],
              data: Object.values(this.results)
            }],
            labels: []
          }
        }
        var summary = {
            fileName: fileName,
            attackCategory: 'TBD',
            analysisName: 'TBD',
            supportedDiagrams: ['PieChart']
        }
        return await this.storeAndReturnResult(fileName, fileContent, summary)
    }
}

module.exports = SourceHostsAnalyser
