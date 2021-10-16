class Manager {

  // TODO: API definition
  //

  // private cache = {}
  // private serializer = null

  constructor(){
    const serializer = new LiveDataSerializer()
  }

  establishConnection(port){
    // TODO: instatiate collectorConnector and miners

    this.setupCollector()
    this.setupMiners()

    console.log('manager: connection established.')
  }

  setupCollector(){}

  setupMiners(){}

  // refer to javascript event loop feature
  startStreaming(){}

  tearDown(){}



}

class LiveDataSerializer {


}

module.exports = Manager

