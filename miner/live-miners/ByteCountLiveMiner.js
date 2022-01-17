const { socketBroadcaster } = require('../../api/live-analysis/SocketHandler')

class ByteCountLiveMiner {
  constructor (dataBroadcaster) {
    this.dataBroadcaster = dataBroadcaster
    this.setUp()
  }

  setUp () {
    console.log('miner: setup')
    this.dataBroadcaster.on('data', (data) => { this.mining(data) })
  }

  mining (data) {
    console.log('mining total number bytes')
    const flows = data.flows
    let totInBytes = 0
    for (const i in flows) {
      // console.log(flows[i])
      totInBytes += flows[i].in_bytes
    }
    const res = { total_in_bytes: totInBytes, timestamp: Date.now() }
    console.log(res)
    socketBroadcaster.emit('newData', res)
  }
}

module.exports = ByteCountLiveMiner
