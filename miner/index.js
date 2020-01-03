const { parseAndCheckArguments } = require('./cli/CLI')
const { PacketEmitter, PortAnalyser, MetricAnalyser, PortUsageClusteredAnalyser, TopTwentyPortsByTrafficAnalyser} = require('./exports')
const path = require('path')
try {
  var settings = parseAndCheckArguments(process.argv)
  analyseFileInProjectFolder(settings.pcapPath)  
} catch (e) {
    console.error(e.message)
    process.exit(1)
}

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

    try {
        emitter.startPcapSession(target)
    } catch (e) {
        console.error(e)
        process.exit(1)
    }

    emitter.on('complete', async () => {
        var portAnalysisResult = await portAnalyser.postParsingAnalysis()
        var metricAnalysisResult = await metricAnalyser.postParsingAnalysis()
        var topTwentyResult = await topTwentyAnalyser.postParsingAnalysis()
        var clusteredResult = await clusteredAnalyser.postParsingAnalysis()
        console.log('Port scan analysis done')
        var output = JSON.stringify({
          portanalysis: portAnalysisResult,
          general: metricAnalysisResult,
          topTwenty: topTwentyResult,
          clusteredPorts: clusteredResult
        })
        if(process && process.send) {
            // If this function exists in scope we know that we are in a forked ChildProcess
            // This will then send the output of the miners over IPC to the master process
            process.send(output)
        } else {
            console.log(output)
        }
    })
}

