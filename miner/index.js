const { parseAndCheckArguments } = require('./cli/CLI')
var PacketEmitter = require('./parser/PcapParser')
var PortAnalyser = require('./parser/PortScanAnalyser')

try {
    var settings = parseAndCheckArguments(process.argv)
} catch (e) {
    console.error(e.message)
    process.exit(1)
}
console.log('Configured:', settings)
var outFileBaseName = `${settings.pcapPath}-analysed-${new Date().toJSON()}-`

var emitter = new PacketEmitter()
var portAnalyser = new PortAnalyser(emitter, outFileBaseName)

setUpAndRun()

async function setUpAndRun () {
    await portAnalyser.setUp()
    emitter.startPcapSession(settings.pcapPath)
    emitter.on('complete', async () => {
        await portAnalyser.postParsingAnalysis()
    })
}
