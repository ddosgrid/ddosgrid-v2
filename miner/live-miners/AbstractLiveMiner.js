const { socketBroadcaster } = require('../../api/live-analysis/SocketHandler')
const fs = require('fs')

class AbstractLiveMiner {
  constructor (dataBroadcaster, type) {
    this.dataBroadcaster = dataBroadcaster
    this.type = type
    this.aggregatedData = null
    this.timer = null
    this.dumpCounter = 0
    this.logFileBaseName = null
    this.setUp()
    this.loop = setInterval(this.emitAggregatedData.bind(this), 1000)
  }

  setUp () {
    console.log('miner: setup')
    this.dataBroadcaster.on('data', (data) => { this.miningNetFlowPacket(data) })
  }

  emitAggregatedData () {
    console.log('emitAggregatedData')
    if (this.aggregatedData) {
      this.aggregatedData.timestampBeforeEmittingToSocketBroadcaster = Date.now()
      socketBroadcaster.emit('newData', this.aggregatedData)
      console.log(this.aggregatedData)

      // log the aggregated data for later analysis
      if (!this.logFileBaseName) {
        throw Error('No log file base name specified!')
      }
      const fileName = './evaluation-data/' + this.logFileBaseName + '_' + this.dumpCounter.toString() + '.json'
      fs.writeFile(fileName, JSON.stringify(this.aggregatedData), (err) => {
        if (err) {
          throw err
        }
        console.log('aggregated data saved to file')
        this.dumpCounter += 1
      })
      this.aggregatedData = null // reset to null if data is sent
    } else {
      console.log('no aggregated data')
      socketBroadcaster.emit('newData', { miner: this.type, aggData: 0, timestampBeforeMiningFirstFlowPacket: Date.now() })
    }
  }

  aggregateMinedData (minedData) {
    // console.log('aggregateMinedData')
    if (!this.aggregatedData) {
      this.aggregatedData = minedData
    } else {
      this.aggregatedData.aggData += minedData.aggData
      this.aggregatedData.timestampAfterAggregation = Date.now()
    }
  }

  miningNetFlowPacket (data) {
    throw Error("Method 'miner' is not implemented")
  }

  stopMining () {
    console.log('stop mining')
    this.dataBroadcaster.removeAllListeners()
    clearInterval(this.loop)
  }
}

module.exports = AbstractLiveMiner