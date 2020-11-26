const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')
const N = 5
const analysisName = `top-${N}-vlan-domains-by-eth-traffic`

class VLANDomains extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.results = {
      // store interim results here
      // { vlanid: '1.2.3.4', count: 1 }
    }
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.pcapParser.on('ethernetPacket', this.checkEth.bind(this))
  }

  checkEth (ethPacket) {
    try {
      var vlanID = ethPacket.vlan.id
      var existingEntry = this.results.hasOwnProperty(vlanID)

      if (existingEntry) {
        this.results[vlanID]++
      } else {
        this.results[vlanID] = 1
      }
    } catch (e) {}
  }

  getName () {
    return `Top ${N} VLANs by Ethernet traffic`
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  async postParsingAnalysis () {
    var mapped = Object.keys(this.results).map((key) => {
      return {id: key, count: this.results[key]}
    })
    var sortedByCount = this.sortEntriesByCount(mapped)
    var topNentries = this.getTopN(sortedByCount, N)

    var fileName = `${this.baseOutPath}-${analysisName}.json`
    var fileContent = {
      // Signal and format to visualize as piechart
      piechart: {
        datasets: [{
          backgroundColor: ['#D33F49', '#77BA99', '#23FFD9', '#27B299', '#831A49'],
          data: this.formatData(topNentries)
        }],
        labels: this.formatLabels(topNentries)
      },
      hint: 'The labels of this chart have been computed using temporally sensitive data'
    }
    var summary = {
      fileName: fileName,
      attackCategory: 'Link Layer',
      analysisName: `Top ${N} VLANs`,
      supportedDiagrams: ['PieChart']
    }
    return await this.storeAndReturnResult(fileName, fileContent, summary)
  }

  formatData (elements) {
    return elements.map(entry => entry.count)
  }
  formatLabels (elements) {
    return elements.map(entry => entry.id)
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

module.exports = VLANDomains
