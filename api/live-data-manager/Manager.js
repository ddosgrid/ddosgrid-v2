import SampleConcreteLiveMiner from '../../miner/live-miners/SampleConcreteLiveMiner'
import NetflowCollector from '../collector-connector/collectorConnector'

class Manager {

  // TODO: API definition
  //

  // private cache = {}
  // private serializer = null

  constructor(){
    const serializer = new LiveDataSerializer()
    let collectorConnector = null
    let miner = null
  }

  establishConnection(port){
    // TODO: instatiate collectorConnector and miners

    this.setupCollector()
    this.setupMiners()

    console.log('manager: connection established.')
  }

  setupCollector(){
    this.collectorConnector = new NetflowCollector(4000)
  }

  setupMiners(){
    this.miner = SampleConcreteLiveMiner(this.collectorConnector)
  }

  // refer to javascript event loop feature
  startStreaming(){}

  tearDown(){}



}

class LiveDataSerializer {


}

module.exports = Manager

