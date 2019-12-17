//const { PacketEmitter, PortAnalyser} = require('ddosgrid-miner')
const { PacketEmitter, PortAnalyser, MetricAnalyser} = require('../../../miner')
const path = require('path')


function analyseFileInProjectFolder (projectPath, cb) {
    var emitter = new PacketEmitter()
    var portAnalyser = new PortAnalyser(emitter, projectPath)
    var metricAnalyser = new MetricAnalyser(emitter, projectPath)

    setUpAndRun(emitter, portAnalyser, metricAnalyser, projectPath, cb)

}
async function setUpAndRun (emitter, portAnalyser, metricAnalyser, target, cb) {
    await portAnalyser.setUp()
    await metricAnalyser.setUp()

    emitter.startPcapSession(target)

    emitter.on('complete', async () => {
        var portAnalysisResult = await portAnalyser.postParsingAnalysis()
        var metricAnalysisResult = await metricAnalyser.postParsingAnalysis()
        console.log('Port scan analysis done')
        cb({
          portanalysis: portAnalysisResult,
          general: metricAnalysisResult
        })
    })
}

module.exports = { analyseFileInProjectFolder }
