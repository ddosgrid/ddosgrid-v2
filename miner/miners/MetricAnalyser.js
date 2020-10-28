const AbstractPCAPAnalyser = require('./AbstractPCAPAnalyser')
const { spawn, fork } = require('child_process')
const path = require('path')

class MetricAnalyser extends AbstractPCAPAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.buffer = {
      ippackets: [],
      ports: []
    }
    this.results = {
      srcIps: new Set(),
      dstIps: new Set(),
      srcPorts: new Set(),
      dstPorts: new Set()
    }
    this.output = {
      start: null,
      end: null,
      duration: null,
      nrOfIPpackets: 0,
      attackSizeInBytes: 0,
      attackBandwidthInBps: 0,
      avgPacketSize: 0,
      nrOfIPv4Packets: 0,
      nrOfIPv6Packets: 0,
      nrOfSrcIps: 0,
      nrOfDstIps: 0,
      nrOfUDPPackets: 0,
      nrOfTCPPackets: 0,
      udpToTcpRatio: 0
    }
  }

  async setUp () {
    this.pcapParser.on('pcapPacket', this.countPacketSize.bind(this))

    this.pcapParser.on('firstPcapPacket', this.noteStartTime.bind(this))
    this.pcapParser.on('lastPcapPacket', this.noteEndTime.bind(this))

    this.pcapParser.on('ipPacket', this.countIPPackets.bind(this))
    this.pcapParser.on('ipv4Packet', this.countipv4.bind(this))
    this.pcapParser.on('ipv6Packet', this.countipv6.bind(this))

    this.pcapParser.on('transportPacket', this.countPorts.bind(this))
    this.pcapParser.on('udpPacket', this.countUdpPackets.bind(this))
    this.pcapParser.on('tcpPacket', this.counttcpPackets.bind(this))
    const workerScript = path.join(__dirname, 'MetricAnalyserWorker.js')
    this.worker = fork(workerScript)
    this.worker.on('error', function (e) { console.log('error in sub:', e) })
    this.worker.on('close', function (e) { console.log('close in sub:', e) })
    this.worker.on('exit', function (e) { console.log('exit in sub:', e) })
  }

  getName () {
    return 'Miscellaneous Metrics'
  }

  noteStartTime (pcapPacket) {
    this.output.start = pcapPacket.pcap_header.tv_sec
  }

  noteEndTime (pcapPacket) {
    this.output.end = pcapPacket.pcap_header.tv_sec
    this.output.duration = this.output.end - this.output.start
  }

  countPacketSize (pcapPacket) {
    this.output.attackSizeInBytes += pcapPacket.pcap_header.len
  }

  countUdpPackets () {
    this.output.nrOfUDPPackets++
  }

  counttcpPackets () {
    this.output.nrOfTCPPackets++
  }

  countPorts (transportPacket) {
    this.buffer.ports.push(`${transportPacket.sport}@${transportPacket.dport}`)
    if (this.buffer.ports.length === 1000) {
      this.worker.send({
        type: 'tppacket',
        packet: this.buffer.ports
      })
      this.buffer.ports = []
    }
  }

  countIPPackets (ipPacket) {
    try {
      var srcAddr = ipPacket.saddr.addr.join('.')
      var dstAddr = ipPacket.daddr.addr.join('.')
      this.buffer.ippackets.push(srcAddr + '@' + dstAddr)

      if (this.buffer.ippackets.length === 1000) {
        this.worker.send({
          type: 'ippacket',
          packet: this.buffer.ippackets
        })
        this.buffer.ippackets = []
      }
    } catch (e) {

    }
  }

  countipv4 () {
    this.output.nrOfIPv4Packets++
  }

  countipv6 () {
    this.output.nrOfIPv6Packets++
  }

  async postParsingAnalysis () {
    var workerResult = await this.getInfoFromWorker()

    this.results.srcIps = workerResult.srcIps
    this.results.dstIps = workerResult.dstIps
    this.results.srcPorts = workerResult.srcPorts
    this.results.dstPorts = workerResult.dstPorts
    this.output.nrOfSrcPorts = workerResult.nrOfSrcPorts
    this.output.nrOfDstIps = workerResult.nrOfDstPorts
    this.output.nrOfIPpackets = workerResult.nrOfIPpackets
    this.output.nrOfSrcIps = workerResult.nrOfSrcIps
    this.output.nrOfDstIps = workerResult.nrOfDstIps

    this.output.attackBandwidthInBps = this.output.attackSizeInBytes / this.output.duration
    this.output.avgPacketSize = this.output.attackSizeInBytes / this.output.nrOfIPpackets
    this.output.udpToTcpRatio = this.output.nrOfUDPPackets / this.output.nrOfTCPPackets
    var fileName = `${this.baseOutPath}-generic-metrics.json`
    var outputToStore = this.output
    var resultSummary = {
      attackCategory: 'Network State',
      analysisName: 'Miscellaneous Metrics',
      supportedDiagrams: [],
      fileName: fileName,
      metrics: outputToStore
    }
    return await this.storeAndReturnResult(fileName, outputToStore, resultSummary)
  }

  async getInfoFromWorker () {
    return new Promise((resolve, reject) => {
      console.log('listen to forked process')
      this.worker.on('message', (m) => {
        console.log('received from child:', m)
        resolve(m)
        this.worker.kill()
      })
      this.worker.send({ type: 'postanalysis' })
    })
  }
}

module.exports = MetricAnalyser
