let AbstractLiveMiner = require('./AbstractLiveMiner')
const { socketBroadcaster } = require('../../api/live-analysis/SocketHandler')

class SampleConcreteLiveMiner {
    constructor(dataBroadcaster) {
        this.dataBroadcaster = dataBroadcaster
        this.setUp()
    }

    setUp() {
        console.log('miner: setup')
        this.dataBroadcaster.on('data', (data) => { this.miningTotalBytes(data) })
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
        let res = {'total_in_bytes': tot_in_bytes, 'timestamp': Date.now()}
        console.log(res)
        socketBroadcaster.emit('newData', res)

        }
}

module.exports = SampleConcreteLiveMiner
