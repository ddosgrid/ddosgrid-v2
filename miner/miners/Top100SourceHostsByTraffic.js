const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')
const N = 100
const analysisName = `top-${N}-source-hosts-by-traffic`

class Top100SourceHostsAnalyser extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.results = [
      // store interim results here
      // { addr: '1.2.3.4', count: 1 }
    ]
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.whois = require('whois-json')
    this.pcapParser.on('ipv4Packet', this.countIPv4Address.bind(this))
  }

  countIPv4Address (ipv4Packet) {
    var srcAddress = ipv4Packet.saddr.addr.join('.')
    var existingEntry = this.results.find(item => item.addr === srcAddress)

    if (existingEntry) {
      existingEntry.count++
    } else {
      this.results.push({ addr: srcAddress, count: 1 })
    }
  }

  getName () {
    return `Top ${N} source hosts (IPv4)`
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  async postParsingAnalysis () {
    var sortedByCount = this.sortEntriesByCount(this.results)
    var topNentries = this.getTopN(sortedByCount, N)

    var fileName = `${this.baseOutPath}-${analysisName}.json`
    var fileContent = {
      // Signal and format to visualize as worldmap
      worldmap: await this.formatLabelsForWorldMap(topNentries),
      hint: 'The labels of this chart have been computed using temporally sensitive data'
    }
    var summary = {
      fileName: fileName,
      attackCategory: 'Network State',
      analysisName: `Top ${N} sources by traffic`,
      supportedDiagrams: ['WorldMap']
    }
    return await this.storeAndReturnResult(fileName, fileContent, summary)
  }

  formatData (elements) {
    return elements.map(entry => entry.count)
  }

  async formatLabelsForWorldMap (addresses) {
    var result = {}
    for (var address of addresses) {
      try {
        var { country } = await this.whois(address.addr)
        if (country) {
          var formattedCountry = tryFormatCountry(country)
          if (hasProp(result, 'country')) {
            result[formattedCountry] += address.count
          } else {
            result[formattedCountry] = address.count
          }
          // console.log(result)
        }
      } catch (e) {
      }
    }
    return result
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

module.exports = Top100SourceHostsAnalyser
