//const { PacketEmitter, PacketAnalyser} = require('ddosgrid-miner')
const { PacketEmitter, PortAnalyser} = require('../../../miner')
const path = require('path')


function analyseFileInProjectFolder (projectPath) {
    var emitter = new PacketEmitter()
    var analyser = new PortAnalyser(emitter, projectPath)

    setUpAndRun(emitter, analyser, projectPath)

}
async function setUpAndRun (emitter, analyser, target) {
    await analyser.setUp()
    emitter.startPcapSession(target)
    emitter.on('complete', async () => {
       await analyser.postParsingAnalysis()
        console.log('Port scan analysis done')
    })
}

module.exports = {analyseFileInProjectFolder}