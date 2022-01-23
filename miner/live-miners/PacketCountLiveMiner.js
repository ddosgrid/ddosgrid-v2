const { socketBroadcaster } = require('../../api/live-analysis/SocketHandler')

class PacketCountLiveMiner {
  constructor (dataBroadcaster) {
    this.dataBroadcaster = dataBroadcaster
    this.setUp()
  }

  setUp () {
    console.log('miner: setup')
    this.dataBroadcaster.on('data', (data) => { this.mining(data) })
  }

  mining (data) {
    console.log('mining total number packets')
    const flows = data.flows
    let totInPackets = 0
    for (const i in flows) {
      totInPackets += flows[i].in_pkts
    }
    const res = { miner: 'PacketCount', total_in_packets: totInPackets, timestamp: Date.now() }
    console.log(res)
    socketBroadcaster.emit('newData', res)
  }
}

module.exports = PacketCountLiveMiner
