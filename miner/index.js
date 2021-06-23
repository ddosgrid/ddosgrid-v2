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
  BGPMessages
} = require('./exports')
const colors = require('colors')

try {
  var settings = parseAndCheckArguments(process.argv)
  console.log('SETTINGS:', settings)
  console.log('✓ Input check completed')
  if(settings.live) {
    var { targetInterface } = settings
    var projectPath = `${process.cwd()}/results/live-analysis-${targetInterface}-${Date.now()}`
    analyseFromInterface(targetInterface)
  } else {
    analyseFileInProjectFolder(settings.pcapPath)
  }
} catch (e) {
  console.error(e.message)
  process.exit(1)
}

function analyseFromInterface (targetInterface) {
  console.log('✓ Live analysis started')
  var emitter = new PacketEmitter()
  var activeMiners = createMiners(emitter, projectPath)

  setUpAndRunLive(emitter, activeMiners, targetInterface)
}

function analyseFileInProjectFolder (projectPath) {
  console.log('✓ Offline analysis started')
  var emitter = new PacketEmitter()
  var activeMiners = createMiners(emitter, projectPath)

  setUpAndRun(emitter, activeMiners, projectPath)
}

function createMiners (emitter, projectPath) {
  var miners = [
    MetricAnalyser,
    VLANDomains,
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
    DeviceAnalyzer
  ]
  var activeMiners = miners.map(Miner => new Miner(emitter, projectPath))
  return activeMiners
}

async function setUpAndRun (emitter, activeMiners, target) {
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
    emitter.startPcapSession(target)
    console.log(`✓ Decoding has started...`)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  emitter.on('complete', async () => {
    finalizeAnalysis(decodingTimer, activeMiners)
  })
}

async function setUpAndRunLive (emitter, activeMiners, target) {
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
    emitter.startLiveSession(target)
    console.log(`✓ Decoding has started...`)

    process.on('SIGTERM', () => {
      emitter.closeLiveSession()
      finalizeAnalysis(decodingTimer, activeMiners)
    })
    process.on('SIGINT', () => {
      emitter.closeLiveSession()
      finalizeAnalysis(decodingTimer, activeMiners)
    })
    /*
    setTimeout(async () => {
      emitter.closeLiveSession()
      finalizeAnalysis(decodingTimer, activeMiners)
    }, 60000)
    */
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

async function finalizeAnalysis (decodingTimer, activeMiners) {
  var decodingDuration = (new Date() - decodingTimer) / 1000 + 's'
  console.log(`\n✓ Decoding has finished (${decodingDuration.green}), starting post-parsing analysis`)
  // var results = activeMiners.map(async (miner) => { return await miner.postParsingAnalysis() })
  console.log('✓ Post-parsing analysis of the following miners has completed:')
  var results = []
  var postParsingStart = new Date()
  for (var miner of activeMiners) {
    let startTimer = new Date()
    var result = await miner.postParsingAnalysis()
    results.push(result)
    let duration = (new Date() - startTimer) / 10000
    console.log(`\t- (${duration}s) \t${miner.getName()}`)
  }
  var postParsingDuration = (new Date() - postParsingStart) / 1000 + 's'
  console.log('\t==================================================================')
  console.log(`\tTotal: ${postParsingDuration}`)
  console.log('✓ All miners have finished.\n')
  var output = JSON.stringify(results)
  if (process && process.send) {
    // If this function exists in scope we know that we are in a forked ChildProcess
    // This will then send the output of the miners over IPC to the master process
    process.send(output)
  } else {
    console.log(output)
  }
}
