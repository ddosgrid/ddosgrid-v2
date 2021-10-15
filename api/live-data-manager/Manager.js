class Manager {

  // TODO: API definition
  //

  private cache = {}
  private serializer = null

  constructor(){
    serializer = LiveDataSerializer()
  }

  establishConnection(){}

  setupCollector(){}

  setupMiners(){}

  // refer to javascript event loop feature
  startStreaming(){}

  tearDown(){}



}

class LiveDataSerializer {


}

module.exports = Manager

