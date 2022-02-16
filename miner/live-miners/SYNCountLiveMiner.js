const AbstractLiveMiner = require('./AbstractLiveMiner')

class SYNCountLiveMiner extends AbstractLiveMiner {
  // eslint-disable-next-line no-useless-constructor
  constructor (dataBroadcaster, type) {
    super(dataBroadcaster, type)
    this.logFileBaseName = 'TCPFlagMiner'
  }

  miningNetFlowPacket (data) {
    console.log('mining total number TCP flags')
    const timeStamp = Date.now()
    const flows = data.flows
    let totInFlags = 0
    for (const i in flows) {
      if (flows[i].tcp_flags === 2) {
        totInFlags++
      }
    }
    const res = { miner: this.type, aggData: totInFlags, timestampBeforeMiningFirstFlowPacket: timeStamp }
    this.aggregateMinedData(res)
  }
}

module.exports = SYNCountLiveMiner
