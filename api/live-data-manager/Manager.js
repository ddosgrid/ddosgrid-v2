let SampleConcreteLiveMiner = require('../../miner/live-miners/SampleConcreteLiveMiner')
let NetflowCollector = require('../collector-connector/collectorConnector')
let EventEmitter = require('events')

class Manager {

  constructor(){
    this.collectorConnector = null
    this.miner = null
    this.is_data = false
    this.dataBroadcaster = new EventEmitter()
    /*this.dataBroadcaster.on('data', (data) => {
      data ? this.is_data = true : this.is_data = false
    })*/
  }

  establishConnection(port){
    this.setupCollector(port)
    this.setupMiners()
    console.log('manager: connection established.')
  }

  setupCollector(port){
    this.collectorConnector = new NetflowCollector(port, this.dataBroadcaster)
  }

  setupMiners(){
    this.miner = new SampleConcreteLiveMiner(this.dataBroadcaster)
  }

  // refer to javascript event loop feature
  startStreaming(){
    console.log('manager: start streaming')
    this.collectorConnector.start()
  }

  tearDown(){}



}

let manager = new Manager()
manager.establishConnection(4000)
manager.startStreaming()

module.exports = Manager

