let ByteCountLiveMiner = require('../../miner/live-miners/ByteCountLiveMiner')
let PacketCountLiveMiner = require('../../miner/live-miners/PacketCountLiveMiner')
let NetflowCollector = require('../collector-connector/collectorConnector')
let TCPFlagCountLiveMiner = require('../../miner/live-miners/TCPFlagCountLiveMiner')
let EventEmitter = require('events')

class Manager {

  constructor() {
    this.collectorConnector = null
    this.miners = null
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
    const byteMiner = new ByteCountLiveMiner(this.dataBroadcaster, 'ByteCount')
    const packetMiner = new PacketCountLiveMiner(this.dataBroadcaster, 'PacketCount')
    const TCPFlagMiner = new TCPFlagCountLiveMiner(this.dataBroadcaster, 'TCPFlagCount')
    this.miners = [byteMiner, packetMiner, TCPFlagMiner]
    // this.miners = [packetMiner]
  }

  // refer to javascript event loop feature
  startStreaming() {
    console.log('manager: start streaming')
    this.collectorConnector.start()
  }

  tearDown() {
    this.collectorConnector.stop()
    this.miners.forEach(miner => miner.stopMining())
  }
}

// const manager = new Manager()
// manager.establishConnection(4001)

module.exports = Manager