
class AbstractLiveMiner {
    constructor(collectorConnector){
        this.collectorConnector = collectorConnector
    }

    setUp(){
        /*
        Get ready for getting a stream of data to be analyzed.
        */
    }

    startStreaming(){
        /*
        Get data stream of connector and analyze the data.
        Forward the analyzed data to the websocket API.
        */
    }
}

export default AbstractLiveMiner
