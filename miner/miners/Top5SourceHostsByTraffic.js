const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')
const N = 5
const analysisName = `top-${N}-source-hosts-by-traffic`

class Top5SourceHostsAnalyser extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.results = {
      // store interim results here
      // { addr: '1.2.3.4', count: 1 }
    }
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.whois = require('whois-json')
    this.pcapParser.on('ipv4Packet', this.countIPv4Address.bind(this))
  }

  countIPv4Address (ipv4Packet) {
    var srcAddress = ipv4Packet.saddr.addr.join('.')
    var existingEntry = this.results.hasOwnProperty(srcAddress)

    if (existingEntry) {
      this.results[srcAddress]++
    } else {
      this.results[srcAddress] = 1
    }
  }

  getName () {
    return `Top ${N} source hosts (IPv4)`
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  async postParsingAnalysis () {
    var mapped = Object.keys(this.results).map(addr => {return { addr: addr, count: this.results[addr] }})
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
        labels: await this.formatLabelsForPieChart(topNentries)
      },
      hint: 'The labels of this chart have been computed using temporally sensitive data'
    }
    var summary = {
      fileName: fileName,
      attackCategory: 'Network State',
      analysisName: `Top ${N} sources by traffic`,
      supportedDiagrams: ['PieChart']
    }
    return await this.storeAndReturnResult(fileName, fileContent, summary)
  }

  formatData (elements) {
    return elements.map(entry => entry.count)
  }

  async formatLabelsForPieChart (elements) {
    var addresses = elements.map(entry => entry.addr)
    var result = []
    for (var address of addresses) {
      try {
        var { route, origin, country } = await this.whois(address)

        // Sometimes we know all three, sometimes only country and ASN and sometimes none
        if (route && origin && country && route !== 0 && origin !== 0 && country !== 0) {
          result.push(`${address} (${route}, ${origin}, ${country})`)
        } else if (origin && country && origin !== 0 && country !== 0) {
          result.push(`${address} (${origin}, ${country})`)
        } else {
          result.push(address)
        }
      } catch (e) {
        result.push(address)
      }
    }
    return result.slice(0, 5)
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

function tryFormatCountry (countryString) {
  try {
    // This just removes the whitespace and duplicates if exist
    var containsWhiteSpace = countryString.substring(' ') === -1
    if(containsWhiteSpace) {
      return countryString
    } else {
      return countryString.split(' ')[0]
    }
  } catch (e) {
    return countryString
  }
}

function hasProp (target, prop) {
  return Object.prototype.hasOwnProperty.call(target, prop)
}

module.exports = Top5SourceHostsAnalyser
