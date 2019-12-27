const GenericPcapAnalyser = require('./GenericPcapAnalyser')

class MetricAnalyser extends GenericPcapAnalyser {
    constructor(parser, outPath) {
        super(parser, outPath);
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
          nrOfSrcPorts: 0,
          nrOfDstPorts: 0,
          nrOfUDPPackets: 0,
          nrOfTCPPackets:0,
          udpToTcpRatio: 0
        }
    }
    async setUp() {
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
      try {
        var srcPort = transportPacket.sport
        var dstPort = transportPacket.dport
        if(!this.results.dstPorts.has(dstPort)) {
          this.results.dstPorts.add(dstPort)
          this.output.nrOfDstPorts++
        }
        if(!this.results.srcPorts.has(srcPort)) {
          this.results.srcPorts.add(srcPort)
          this.output.nrOfSrcPorts++
        }
      } catch (e) {
        console.log('Unable to process transport-level packet:', transportPacket)
      }
    }
    countIPPackets (ipPacket) {
      this.output.nrOfIPpackets++
      try {
        var srcAddr = ipPacket.saddr.addr.join('.')
        var dstAddr = ipPacket.daddr.addr.join('.')
        if(!this.results.srcIps.has(srcAddr)) {
          this.results.srcIps.add(srcAddr)
          this.output.nrOfSrcIps++
        }
        if(!this.results.dstIps.has(dstAddr)) {
          this.results.dstIps.add(dstAddr)
          this.output.nrOfDstIps++
        }
      } catch(e) {
        console.log('Unable to process IP packet:', ipPacket)
      }
    }
    countipv4 () {
      this.output.nrOfIPv4Packets++
    }
    countipv6 () {
      this.output.nrOfIPv6Packets++
    }
    async postParsingAnalysis() {
      this.output.attackBandwidthInBps = this.output.attackSizeInBytes / this.output.duration
      this.output.avgPacketSize = this.output.attackSizeInBytes / this.output.nrOfIPpackets
      this.output.udpToTcpRatio = this.output.nrOfUDPPackets / this.output.nrOfTCPPackets
      return new Promise((resolve, reject) => {
        const fs = require('fs')
        var fileName = `${this.baseOutPath}-generic-metrics.json`
        var outputToStore = this.output
        fs.writeFile(fileName, JSON.stringify(outputToStore), function (err) {
          if(err) {
            console.err(`Error writing file ${fileName}.`)
            reject(err)
          }
          resolve({
            fileName: fileName,
            metrics: outputToStore
          })
        })
      })
    }
}

module.exports = MetricAnalyser
