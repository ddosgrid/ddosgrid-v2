const { parseAndCheckArguments } = require('./cli/CLI')
const {
  PacketEmitter,
  MetricAnalyser,
  PortUsageClusteredAnalyser,
  TopTwentyPortsByTrafficAnalyser,
  SynStateAnalyser,
  IPVersionAnalyser,
  Top5SourceHostsAnalyser,
  Top100SourceHostsAnalyser,
  HTTPVerbs,
  HTTPEndpoints,
  BrowserAndOSAnalyzer,
  DeviceAnalyzer
} = require('./exports')

try {
  var settings = parseAndCheckArguments(process.argv)
  console.log('✓ Input check completed')
  console.log('#################################################')
  analyseFileInProjectFolder(settings.pcapPath)
} catch (e) {
  console.error(e.message)
  process.exit(1)
}

async function analyseFileInProjectFolder (projectPath) {
  var miners = [
    MetricAnalyser,
    TopTwentyPortsByTrafficAnalyser,
    PortUsageClusteredAnalyser,
    SynStateAnalyser,
    IPVersionAnalyser,
    Top5SourceHostsAnalyser,
    Top100SourceHostsAnalyser,
    HTTPVerbs,
    HTTPEndpoints,
    BrowserAndOSAnalyzer,
    DeviceAnalyzer
  ]
  for (var Miner of miners) {
    var emitter = new PacketEmitter()
    var activeMiner = new Miner(emitter, projectPath)
    console.log(`${activeMiner.getName().toUpperCase()}`)
    await setUpAndRun(emitter, [ activeMiner ], projectPath)
  }

}
async function setUpAndRun (emitter, activeMiners, target) {
  return new Promise(async (resolve, reject) => {
    // The NodeJS version used (10) does not support Promise.map
    var setupTimer = new Date()
    for (var miner of activeMiners) {
      await miner.setUp()
    }
    var setupDuration = (new Date() - setupTimer) / 1000
    console.log(`✓ Setup time: (${setupDuration}s)`)

    try {
      var decodingTimer = new Date()
      emitter.startPcapSession(target)
      console.log(`✓ Decoding has started...`)
    } catch (e) {
      console.error(e)
      process.exit(1)
    }

    emitter.on('complete', async () => {
      var decodingDuration = (new Date() - decodingTimer) / 1000
      console.log(`✓ Decoding has finished in ${decodingDuration} seconds`)
      // var results = activeMiners.map(async (miner) => { return await miner.postParsingAnalysis() })
      console.log('✓ Post-parsing analysis has completed:')
      var results = []
      for (var miner of activeMiners) {
        let startTimer = new Date()
        var result = await miner.postParsingAnalysis()
        results.push(result)
        let duration = (new Date() - startTimer) / 10000
        console.log(`\t- (${duration}s) \t${miner.getName()}`)
      }
      console.log('✓ Done')
      var output = JSON.stringify(results)
      if (process && process.send) {
        // If this function exists in scope we know that we are in a forked ChildProcess
        // This will then send the output of the miners over IPC to the master process
        process.send(output)
      } else {
        console.log('#################################################')
        resolve(output)
      }
    })
  })
}
