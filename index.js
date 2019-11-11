const { parseAndCheckArguments } = require('./cli/CLI')
const { PcapParser } = require('./parser/PcapParser')
const parser = new PcapParser()

var settings = parseAndCheckArguments(process.argv)
console.log('Configured:', settings)
parser.parseToJSON(settings.pcapPath, settings.pcapFile, `${settings.pcapPath}.network.json`, `${settings.pcapPath}.summary.json`)

