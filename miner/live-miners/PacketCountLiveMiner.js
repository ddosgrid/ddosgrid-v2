const AbstractLiveMiner = require('./AbstractLiveMiner')

class PacketCountLiveMiner extends AbstractLiveMiner {
  // eslint-disable-next-line no-useless-constructor
  constructor (dataBroadcaster) {
    super(dataBroadcaster)
    this.logFileBaseName = 'PktCountMiner'
  }

  miningNetFlowPacket (data) {
    console.log('mining total number packets')
    const timeStamp = Date.now()
    const flows = data.flows
    let totInPackets = 0
    for (const i in flows) {
      totInPackets += flows[i].in_pkts
    }
    const res = { miner: 'PacketCount', aggData: totInPackets, timestampBeforeMiningFirstFlowPacket: timeStamp }
    this.aggregateMinedData(res)
  }
}

module.exports = PacketCountLiveMiner
