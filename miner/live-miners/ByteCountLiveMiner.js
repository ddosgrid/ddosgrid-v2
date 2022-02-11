const AbstractLiveMiner = require('./AbstractLiveMiner')

class ByteCountLiveMiner extends AbstractLiveMiner {
  // eslint-disable-next-line no-useless-constructor
  constructor (dataBroadcaster, type) {
    super(dataBroadcaster, type)
    this.logFileBaseName = 'ByteCountMiner'
  }

  miningNetFlowPacket (data) {
    // console.log('mining total number bytes')
    const timeStamp = Date.now()
    const flows = data.flows
    let totInBytes = 0
    for (const i in flows) {
      totInBytes += flows[i].in_bytes
    }
    const res = { miner: 'ByteCount', aggData: totInBytes, timestampBeforeMiningFirstFlowPacket: timeStamp }
    this.aggregateMinedData(res)
  }
}

module.exports = ByteCountLiveMiner
