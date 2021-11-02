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
  console.log('✓ Input check completed')
  analyseFileInProjectFolder(settings.pcapPath, settings.mode)
} catch (e) {
  console.error(e.message)
  process.exit(1)
}

function analyseFileInProjectFolder (projectPath, mode) {
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
    DeviceAnalyzer
  ]
  var activeMiners = miners.map(Miner => new Miner(emitter, projectPath))

  setUpAndRun(emitter, activeMiners, projectPath, mode)
}

async function masterSocket () {
  return new Promise(function (resolve, reject) {
    const net = require('net')
    var server = net.createServer(function(socket) {
      socket.on('data', (data) => {
        console.log(data)
        // Now we have some data - ie the client is connected
        resolve(socket)
        try {
          // If we get some JSON before our own result the client was faster
          // Lets store the data in the socket JS object
          if(JSON.parse(data)) {
            var clientRes = JSON.parse(data)
            socket.clientResult = clientRes
            // console.log('client was faster!', clientRes)
            server.close()
          }
        } catch (e) {
        }
      })

    })
    server.listen(1337, '127.0.0.1');
  })
}

async function clientSocket () {
  var net = require('net');

  return new Promise(function (res, rej) {

    var client = new net.Socket();
    client.connect(1337, '127.0.0.1', function() {
      console.log('Connected');
      client.write('Client: Ready!');
    });

    client.on('data', function(data) {
      console.log('Received: ' + data);
    });

    client.on('close', function() {
      console.log('Connection closed');
    });
    res(client)
  })

}

async function setUpAndRun (emitter, activeMiners, target, mode) {
  if(mode && mode == 'master') {
    var socket = await masterSocket()
  } else if(mode && mode == 'follower') {
    var client = await clientSocket()
  }
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
    var decodingDuration = (new Date() - decodingTimer) / 1000 + 's'
    console.log(`\n✓ Decoding has finished (${decodingDuration.green}), starting post-parsing analysis`)
    // var results = activeMiners.map(async (miner) => { return await miner.postParsingAnalysis() })
    console.log('✓ Post-parsing analysis of the following miners has completed:')
    var results = []
    for (var miner of activeMiners) {
      let startTimer = new Date()
      var result = await miner.postParsingAnalysis()
      results.push(result)
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
      console.log('\nOwn result:\n\n', output)
    }
    if(mode && mode == 'master') {
      if(socket.clientResult) {
        // No need to wait as we already have the clients result
        console.log('\nClient result:\n\n', socket.clientResult)
      } else {
        // We don't have it yet, lets wait for it
        clientRes = await awaitResult(socket)
        console.log('\nClient result:\n\n', clientRes)
      }
    } else if (mode && mode == 'follower') {
      // Here we'd need to send the actual results instead of pointers to files
      client.write(JSON.stringify(output))
      client.destroy()
    }
  })
}

async function awaitResult (socket) {
  return new Promise(function (res, rej) {
    socket.on('data', (data) => {
      // Is it json?
      try {
        var js = JSON.parse(data)
        res(js)
        socket.destroy()
      } catch (e) {
        // do nothing, keep listening
      }
    })
  })
}
