const AbstractPCAPAnalyser = require('./AbstractPCAPAnalyser')

class MetricAnalyser extends AbstractPCAPAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.results = {
      srcIps: {
      },
      dstIps: {
      },
      srcPorts: {
      },
      dstPorts: {
      }
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
      nrOfSrcPorts: 0,
      nrOfDstPorts: 0,
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
    if (transportPacket) {
      try {
        var srcPort = transportPacket.sport
        var dstPort = transportPacket.dport
        if (!this.results.dstPorts[dstPort]) {
          this.results.dstPorts[dstPort] = 1
          this.output.nrOfDstPorts++
        }
        if (!this.results.srcPorts[srcPort]) {
          this.results.srcPorts[srcPort] = 1
          this.output.nrOfSrcPorts++
        }
      } catch (e) {
        console.log('Unable to process transport-level packet:', transportPacket)
      }
    }
  }

  countIPPackets (ipPacket) {
    this.output.nrOfIPpackets++
    try {
      var srcAddr = ipPacket.saddr.addr.join('.')
      var dstAddr = ipPacket.daddr.addr.join('.')
      if (!this.results.srcIps[srcAddr]) {
        this.results.srcIps[srcAddr] = 1
        this.output.nrOfSrcIps++
      }
      if (!this.results.dstIps[dstAddr]) {
        this.results.dstIps[dstAddr] = 1
        this.output.nrOfDstIps++
      }
    } catch (e) {
      console.log('Unable to process IP packet:', ipPacket)
    }
  }

  countipv4 () {
    this.output.nrOfIPv4Packets++
  }

  countipv6 () {
    this.output.nrOfIPv6Packets++
  }

  async postParsingAnalysis () {
    console.log('INFO: Memory usage (heap):', process.memoryUsage().heapTotal / 1024 / 1024)
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
}

module.exports = MetricAnalyser
