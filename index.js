const { parseAndCheckArguments } = require('./cli/CLI')
const { PcapParser } = require('./parser/PcapParser')
const parser = new PcapParser()

try {
    var settings = parseAndCheckArguments(process.argv)
} catch (e) {
    console.error(e.message)
    process.exit(1)
}
console.log('Configured:', settings)
parser.parseToJSON(settings.pcapPath, settings.pcapFile, `${settings.pcapPath}.network.json`, `${settings.pcapPath}.summary.json`)

