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
  DeviceAnalyzer,
  UDPvsTCPRatio,
  ICMPMessages,
  VLANDomains,
  BGPMessages,
  MachineLearningFeatureExtraction,
  MachineLearningFeatureExtractionDoH
} = require('./exports')
const colors = require('colors')

try {
  var settings = parseAndCheckArguments(process.argv)
  console.log('✓ Input check completed')
  analyseFileInProjectFolder(settings.pcapPath, settings.attackType)
} catch (e) {
  console.error(e.message)
  process.exit(1)
}

function analyseFileInProjectFolder (projectPath, attackType) {
  console.log('✓ Analysis started')
  var emitter = new PacketEmitter()

  var miners = [
    VLANDomains,
    MetricAnalyser,
    TopTwentyPortsByTrafficAnalyser,
    PortUsageClusteredAnalyser,
    SynStateAnalyser,
    UDPvsTCPRatio,
    IPVersionAnalyser,
    ICMPMessages,
    Top5SourceHostsAnalyser,
    Top100SourceHostsAnalyser,
    // Uncomment to run the experimental BGP miner
    // BGPMessages,
    HTTPVerbs,
    HTTPEndpoints,
    BrowserAndOSAnalyzer,
    DeviceAnalyzer,
    MachineLearningFeatureExtraction,
    MachineLearningFeatureExtractionDoH
  ]

  var activeMiners = miners.map(Miner => new Miner(emitter, projectPath, attackType))

  setUpAndRun(emitter, activeMiners, projectPath, attackType)
}
async function setUpAndRun (emitter, activeMiners, target, attackType) {
  // The NodeJS version used (10) does not support Promise.map
  var setupTimer = new Date()
  for (var miner of activeMiners) {
    await miner.setUp()
  }
  var setupDuration = (new Date() - setupTimer) / 1000
  console.log(`✓ Setup of the following miners has completed (${setupDuration}s):`)
  activeMiners.forEach(miner => {
    console.log(`\t- ${miner.getName()}`)
  })

  try {
    var decodingTimer = new Date()
    emitter.startPcapSession(target, attackType)
    console.log(`✓ Decoding has started...`)

  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  emitter.on('complete', async () => {
    var decodingDuration = (new Date() - decodingTimer) / 1000 + 's'
    console.log(`\n✓ Decoding has finished (${decodingDuration.green}), starting post-parsing analysis`)
    // var results = activeMiners.map(async (miner) => { return await miner.postParsingAnalysis() })
    console.log('✓ Post-parsing analysis of the following miners has completed:')
    var results = []
    for (var miner of activeMiners) {
      let startTimer = new Date()
      var result = await miner.postParsingAnalysis()
      if (Array.isArray(result)) {
        for (var res of result) {
          results.push(res)
        }
      } else {
        results.push(result)
      }
      let duration = (new Date() - startTimer) / 10000
      console.log(`\t- (${duration}s) \t${miner.getName()}`)
    }
    console.log('✓ All miners have finished.')
    var output = JSON.stringify(results)
    if (process && process.send) {
      // If this function exists in scope we know that we are in a forked ChildProcess
      // This will then send the output of the miners over IPC to the master process
      process.send(output)
    } else {
      var jsonPretty = JSON.stringify(JSON.parse(output),null,2)
      console.log(jsonPretty)
    }
  })
}
