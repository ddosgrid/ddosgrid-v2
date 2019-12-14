//const { PacketEmitter, PortAnalyser} = require('ddosgrid-miner')
const { PacketEmitter, PortAnalyser} = require('../../../miner')
const path = require('path')


function analyseFileInProjectFolder (projectPath, cb) {
    var emitter = new PacketEmitter()
    var analyser = new PortAnalyser(emitter, projectPath)

    setUpAndRun(emitter, analyser, projectPath, cb)

}
async function setUpAndRun (emitter, analyser, target, cb) {
    await analyser.setUp()
    emitter.startPcapSession(target)
    emitter.on('complete', async () => {
       var analysisFile = await analyser.postParsingAnalysis()
        console.log('Port scan analysis done')
        cb(analysisFile)
    })
}

module.exports = {analyseFileInProjectFolder}
