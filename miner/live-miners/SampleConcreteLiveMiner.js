let AbstractLiveMiner = require('./AbstractLiveMiner')

class SampleConcreteLiveMiner {
    constructor(dataBroadcaster) {
        this.setUp(dataBroadcaster)
    }

    setUp(dataBroadcaster) {
        console.log('miner: setup')
        dataBroadcaster.on('data', (data) => { this.miningTotalBytes(data) })
    }

    startStreaming() {
        this.collectorConnector
    }

    miningTotalBytes(data) {
        console.log('mining total number bytes')
        let flows = data.flows
        let tot_in_bytes = 0
        for(let i in flows) {
            //console.log(flows[i])
            tot_in_bytes += flows[i].in_bytes
        }
        console.log(tot_in_bytes)
        }
}

module.exports = SampleConcreteLiveMiner
