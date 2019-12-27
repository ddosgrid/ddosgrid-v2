//const { PacketEmitter, PortAnalyser} = require('ddosgrid-miner')
const { PacketEmitter, PortAnalyser, MetricAnalyser, PortUsageClusteredAnalyser, TopTwentyPortsByTrafficAnalyser} = require('../../../miner')
const path = require('path')


function analyseFileInProjectFolder (projectPath, cb) {
    var emitter = new PacketEmitter()
    var portAnalyser = new PortAnalyser(emitter, projectPath)
    var metricAnalyser = new MetricAnalyser(emitter, projectPath)
    var topTwentyAnalyser = new TopTwentyPortsByTrafficAnalyser(emitter, projectPath)
    var clusteredAnalyser = new PortUsageClusteredAnalyser(emitter, projectPath)

    setUpAndRun(emitter, portAnalyser, metricAnalyser, topTwentyAnalyser, clusteredAnalyser, projectPath, cb)

}
async function setUpAndRun (emitter, portAnalyser, metricAnalyser, topTwentyAnalyser, clusteredAnalyser, target, cb) {
    await portAnalyser.setUp()
    await metricAnalyser.setUp()
    await topTwentyAnalyser.setUp()
    await clusteredAnalyser.setUp()

    emitter.startPcapSession(target)

    emitter.on('complete', async () => {
        var portAnalysisResult = await portAnalyser.postParsingAnalysis()
        var metricAnalysisResult = await metricAnalyser.postParsingAnalysis()
        var topTwentyResult = await topTwentyAnalyser.postParsingAnalysis()
        var clusteredResult = await clusteredAnalyser.postParsingAnalysis()
        console.log('Port scan analysis done')
        cb({
          portanalysis: portAnalysisResult,
          general: metricAnalysisResult,
          topTwenty: topTwentyResult,
          clusteredPorts: clusteredResult
        })
    })
}

module.exports = { analyseFileInProjectFolder }
