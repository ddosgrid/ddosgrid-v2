import SampleConcreteLiveMiner from '../../miner/live-miners/SampleConcreteLiveMiner'
class Manager {

  // TODO: API definition
  //

  // private cache = {}
  // private serializer = null

  constructor(){
    const serializer = new LiveDataSerializer()
    let miner = null
  }

  establishConnection(port){
    // TODO: instatiate collectorConnector and miners

    this.setupCollector()
    this.setupMiners()

    console.log('manager: connection established.')
  }

  setupCollector(){}

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

