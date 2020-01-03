var path = require('path')
var PacketEmitter = require('../parser/PcapParser')
var PacketAnalyser = require('../miners/PortScanAnalyser')
var testfile = path.resolve(__dirname, 'testdata', 'ebfe0afeea7f5417f340782d8a4d6f83portscan.pcap')
var outFile = path.resolve(__dirname, 'testdata', 'ebfe0afeea7f5417f340782d8a4d6f83portscan.pcap')

var emitter = new PacketEmitter(testfile)
var analyser = new PacketAnalyser(emitter, outFile)

setUpAndRun()

async function setUpAndRun () {
    await analyser.setUp()
    emitter.startPcapSession(testfile)
    emitter.on('complete', async () => {
        await analyser.postParsingAnalysis()
    })
}
