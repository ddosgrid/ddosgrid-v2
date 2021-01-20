const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')

class SYNFloodFeatureExtraction extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.currentPacketTimeSeconds
    this.windowLengthInSeconds = 1
    this.currentWindowData = {} // used while going through packets
    this.result = []
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.pcapParser.on('pcapPacket', this.handlePcap.bind(this))
    this.pcapParser.on('ethernetPacket', this.handleEthernet.bind(this))
    this.pcapParser.on('ipv4Packet', this.handleIPv4.bind(this))
    //this.pcapParser.on('ipv6Packet', this.handleIPv6.bind(this))
    this.pcapParser.on('transportPacket', this.handleTransportPacket.bind(this))
    this.pcapParser.on('tcpPacket', this.handleTCPPacket.bind(this))
    this.pcapParser.on('udpPacket', this.handleUDPPacket.bind(this))
    this.pcapParser.on('icmpPacket', this.handleICMPPacket.bind(this))

    this.pcapParser.on('complete', this.addLastWindow.bind(this))
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  handlePcap (pcapPacket) {
    if (Object.keys(this.currentWindowData).length == 0) {
      // First packet, no window created yet
      this.currentPacketTimeSeconds = pcapPacket.pcap_header.tv_sec
      this.currentWindowData = this.createNewWindowData(this.currentPacketTimeSeconds)
    } else {
      // regular process
      var newPacketArrivalTimeInSeconds = pcapPacket.pcap_header.tv_sec
      if (newPacketArrivalTimeInSeconds - this.windowLengthInSeconds >= this.currentWindowData.arrival_time) {
        // new window(s) required
        this.result.push(this.calculateWindowResult(this.currentWindowData, this.result.length))
        var skippedWindows = this.numberOfSkippedWindows(newPacketArrivalTimeInSeconds)
        if (skippedWindows > 0) {
          // add skipped windows
          for (var i = 0; i < skippedWindows; i++) {
            var emptyWindowData = this.createNewWindowData(0)
            this.result.push(this.calculateWindowResult(emptyWindowData, this.result.length))
          }
        }
        this.currentPacketTimeSeconds = newPacketArrivalTimeInSeconds
        this.currentWindowData = this.createNewWindowData(this.currentPacketTimeSeconds)
      }
    }
    // create pcap features
    this.currentWindowData.packet_sizes_bytes.push(pcapPacket.pcap_header.len)
    this.currentWindowData.arrival_times.push(pcapPacket.pcap_header.tv_sec * 1000000 + pcapPacket.pcap_header.tv_usec)
    this.currentWindowData.num_packets += 1
    this.currentWindowData.size_bytes += pcapPacket.pcap_header.len
  }

  handleEthernet(ethernetPacket) {

  }

  handleIPv4(ipv4Packet) {
    this.currentWindowData.source_ips.push(ipv4Packet.saddr.addr.join('.'))
  }

  handleTransportPacket(transportPacket) {
    this.currentWindowData.source_ports.push(transportPacket.sport)
    this.currentWindowData.dest_ports.push(transportPacket.dport)
  }

  handleTCPPacket(tcpPacket) {
    this.currentWindowData.num_tcp += 1

    if (tcpPacket.flags.syn) {
      this.currentWindowData.of_tcp_syn += 1
    }

    if (tcpPacket.flags.ack) {
      this.currentWindowData.of_tcp_ack += 1
    }

    if (tcpPacket.flags.fin) {
      this.currentWindowData.of_tcp_fin += 1
    }
  }

  handleUDPPacket(udpPacket) {
    this.currentWindowData.num_udp += 1
  }

  handleICMPPacket(icmpPacket) {
    this.currentWindowData.num_icmp += 1
  }

  addLastWindow() {
    this.result.push(this.calculateWindowResult(this.currentWindowData, this.result.length))
  }

  createNewWindowData(arrivalTime) {
    var newWindowData = {
      arrival_time: arrivalTime,
      packet_sizes_bytes: [],
      num_packets: 0,
      num_bytes: 0,
      source_ips: [],
      source_ports: [],
      dest_ports: [],
      num_err_packets: 0,
      num_tcp: 0,
      num_udp: 0,
      num_icmp: 0,
      num_other: 0,
      of_tcp_syn: 0,
      of_tcp_fin: 0,
      of_tcp_ack: 0,
      arrival_times: [],
    }

    return newWindowData
  }

  numberOfSkippedWindows(newPacketArrivalTimeInSeconds) {
    return ((newPacketArrivalTimeInSeconds - this.currentWindowData.arrival_time) - 1) / this.windowLengthInSeconds
  }

  calculateWindowResult(currentWindowData, windowNr) {
    var newWindowResult = {
      windowNr: windowNr,
      num_packets: currentWindowData.num_packets,
      avg_packet_size: Math.round(currentWindowData.packet_sizes_bytes.reduce((a, b) => a + b, 0) / currentWindowData.num_packets),
      num_bytes: currentWindowData.packet_sizes_bytes.reduce((a, b) => a + b, 0),
      num_unique_packet_lengths: [...new Set(currentWindowData.packet_sizes_bytes)].length,
      num_unique_source_ips: [...new Set(currentWindowData.source_ips)].length,
      num_unique_source_ports: [...new Set(currentWindowData.source_ports)].length,
      num_unique_dest_ports: [...new Set(currentWindowData.dest_ports)].length,
      perc_err_packets: 0,
      tcp_perc: currentWindowData.num_tcp / currentWindowData.num_packets,
      udp_perc: currentWindowData.num_udp / currentWindowData.num_packets,
      icmp_perc: currentWindowData.num_icmp / currentWindowData.num_packets,
      other_perc: currentWindowData.num_other / currentWindowData.num_packets,
      perc_tcp_syn: currentWindowData.of_tcp_syn / currentWindowData.num_packets,
      perc_tcp_fin: currentWindowData.of_tcp_fin / currentWindowData.num_packets,
      perc_tcp_ack: currentWindowData.of_tcp_ack / currentWindowData.num_packets,
      avg_inter_packet_interval: currentWindowData.num_packets === 1 || currentWindowData.num_packets === 0 ? 0 : (currentWindowData.arrival_times[currentWindowData.arrival_times.length -1] - currentWindowData.arrival_times[0]) / currentWindowData.arrival_times.length - 1,
      is_attack: 1,
    }
    return newWindowResult
  }

  getName () {
    return 'Feature Extraction for ML-Based SYN-Flood DDoS Detection'
  }

  async postParsingAnalysis () {
    console.log("finished");
    var fileName = `${this.baseOutPath}-SYN-Flood-features.csv`
    var fileContent = this.result
    var summary = {
      fileName: fileName,
      attackCategory: 'SYN',
      analysisName: 'Feature Extraction for ML-Based SYN-Flood DDoS Detection',
    }
    return await this.storeAndReturnResult(fileName, fileContent, summary)
  }
}

module.exports = SYNFloodFeatureExtraction
