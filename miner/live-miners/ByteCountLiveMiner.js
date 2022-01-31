const { socketBroadcaster } = require('../../api/live-analysis/SocketHandler')
const fs = require('fs')

class ByteCountLiveMiner {
  constructor (dataBroadcaster) {
    this.dataBroadcaster = dataBroadcaster
    this.aggregatedData = null
    this.timer = null
    this.dumpCounter = 0
    this.setUp()
    setInterval(this.emitAggregatedData.bind(this), 3000)
  }

  emitAggregatedData () {
    console.log('emitAggregatedData')
    if (this.aggregatedData) {
      socketBroadcaster.emit('newData', this.aggregatedData)
      console.log(this.aggregatedData)
      const fileName = './evaluation-data/aggregatedByteCountData_' + this.dumpCounter.toString() + '.json'
      fs.writeFile(fileName, JSON.stringify(this.aggregatedData), (err) => {
        if (err) {
          throw err
        }
        console.log('aggregated data saved to file')
        this.dumpCounter += 1
      })
    } else {
      console.log('no aggregated data')
    }
  }

  setUp () {
    console.log('miner: setup')
    this.dataBroadcaster.on('data', (data) => { this.mining(data) })
  }

  aggregateMinedData (minedData) {
    // console.log('aggregateMinedData')
    if (!this.aggregatedData) {
      this.aggregatedData = minedData
    } else {
      this.aggregatedData.total_in_bytes += minedData.total_in_bytes
      this.aggregatedData.timestamp = Date.now()
    }
  }

  mining (data) {
    // console.log('mining total number bytes')
    const flows = data.flows
    let totInBytes = 0
    for (const i in flows) {
      totInBytes += flows[i].in_bytes
    }
    const res = { miner: 'ByteCount', total_in_bytes: totInBytes, timestamp: Date.now() }
    this.aggregateMinedData(res)
  }
}

module.exports = ByteCountLiveMiner
