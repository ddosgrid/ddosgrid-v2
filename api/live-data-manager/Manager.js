let SampleConcreteLiveMiner = require('../../miner/live-miners/SampleConcreteLiveMiner')
let NetflowCollector = require('../collector-connector/collectorConnector')
let EventEmitter = require('events')

class Manager {

  constructor() {
    this.collectorConnector = null
    this.miner = null
    this.dataBroadcaster = new EventEmitter()
  }

  establishConnection(port) {
    this.setupCollector(port)
    this.setupMiners()
    console.log('manager: connection established.')
    this.startStreaming()
  }

  setupCollector(port) {
    this.collectorConnector = new NetflowCollector(port, this.dataBroadcaster)
  }

  setupMiners() {
    this.miner = new SampleConcreteLiveMiner(this.dataBroadcaster)
  }

  // refer to javascript event loop feature
  startStreaming() {
    console.log('manager: start streaming')
    this.collectorConnector.start()
  }

  tearDown() {}

}


module.exports = Manager

