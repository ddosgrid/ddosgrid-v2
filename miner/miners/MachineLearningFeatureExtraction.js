const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')

class MachineLearningFeatureExtraction extends AbstractPcapAnalyser {
  constructor(parser, outPath) {
    super(parser, outPath)
    this.currentPacketTimeSeconds
    this.windowLengthInSeconds = 1
    this.currentWindowData = {} // used while going through packets
    this.result = []
    this.currentAttackType = 0
    this.currentAttackTimes = {}
    this.attackTypes = []
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp() {
    this.pcapParser.on('setAttackTypes', this.handleAttackTypes.bind(this))
    // this.pcapParser.on('firstPcapPacket', this.handleFirstPacket.bind(this))
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

  handleAttackTypes(attackType) {
    // TODO: check if simple attacktype or changing
    if (typeof attackType === 'number') {
      this.currentAttackType = attackType
    } else {
      this.attackTypes = attackType
    }
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  handlePcap(pcapPacket) {
    if (Object.keys(this.currentWindowData).length == 0) {
      // First packet, no window created yet
      this.currentPacketTimeSeconds = pcapPacket.pcap_header.tv_sec
      var newAttackType = this.updateAttackType(this.currentPacketTimeSeconds, this.attackTypes, this.currentAttackType)
      this.currentAttackType = newAttackType.attackType
      this.attackTypes = newAttackType.attackTypes
      this.currentWindowData = this.createNewWindowData(this.currentPacketTimeSeconds, this.attackTypes)
    } else {
      // regular process
      var newPacketArrivalTimeInSeconds = pcapPacket.pcap_header.tv_sec
      if (newPacketArrivalTimeInSeconds - this.windowLengthInSeconds >= this.currentWindowData.arrival_time) {
        // new window(s) required
        this.result.push(this.calculateWindowResult(this.currentWindowData, this.result.length, this.currentAttackType))
        // var skippedWindows = this.numberOfSkippedWindows(newPacketArrivalTimeInSeconds)
        var skippedWindows = 0

        if (skippedWindows > 0) {
          // add skipped windows
          for (var i = 0; i < skippedWindows; i++) {
            var newAttackType = this.updateAttackType(this.currentPacketTimeSeconds, this.attackTypes, this.currentAttackType)
            this.currentAttackType = newAttackType.attackType
            this.attackTypes = newAttackType.attackTypes
            var emptyWindowData = this.createNewWindowData(0, this.attackTypes, true)
            this.result.push(this.calculateWindowResult(emptyWindowData, this.result.length, this.currentAttackType, true))
          }
        }
        this.currentPacketTimeSeconds = newPacketArrivalTimeInSeconds
        var newAttackType = this.updateAttackType(this.currentPacketTimeSeconds, this.attackTypes, this.currentAttackType)
        this.currentAttackType = newAttackType.attackType
        this.attackTypes = newAttackType.attackTypes
        this.currentWindowData = this.createNewWindowData(this.currentPacketTimeSeconds, this.attackTypes)
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
    this.currentWindowData.dest_ips.push(ipv4Packet.daddr.addr.join('.'))
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
    if (icmpPacket.type === 0) {
      this.currentWindowData.of_icmp_echo_reply += 1
    }

    if (icmpPacket.type === 3) {
      this.currentWindowData.of_icmp_dest_unreachable += 1
    }
  }

  addLastWindow() {
    this.result.push(this.calculateWindowResult(this.currentWindowData, this.result.length, this.currentAttackType))

    this.result = this.result.filter(window => window.num_packets > 0)
  }

  createNewWindowData(arrivalTime, attackTypes, emptyWindow = false) {
    var newWindowData = {
      arrival_time: arrivalTime,
      packet_sizes_bytes: !emptyWindow ? [] : 0,
      num_packets: 0,
      num_bytes: 0,
      source_ips: !emptyWindow ? [] : 0,
      dest_ips: !emptyWindow ? [] : 0,
      source_ports: !emptyWindow ? [] : 0,
      dest_ports: !emptyWindow ? [] : 0,
      num_tcp: 0,
      num_udp: 0,
      num_icmp: 0,
      num_other: 0,
      of_tcp_syn: 0,
      of_tcp_fin: 0,
      of_tcp_ack: 0,
      of_icmp_echo_reply: 0,
      of_icmp_dest_unreachable: 0,
      arrival_times: !emptyWindow ? [] : 0,
    }

    return newWindowData
  }

  numberOfSkippedWindows(newPacketArrivalTimeInSeconds) {
    return ((newPacketArrivalTimeInSeconds - this.currentWindowData.arrival_time) - 1) / this.windowLengthInSeconds
  }

  calculateWindowResult(currentWindowData, windowNr, attackType, emptyWindow = false) {
    var newWindowResult = {
      arrival_time: currentWindowData.arrival_time,
      num_packets: currentWindowData.num_packets,
      avg_packet_size: !emptyWindow ? Math.round(currentWindowData.packet_sizes_bytes.reduce((a, b) => a + b, 0) / currentWindowData.num_packets) : 0,
      num_bytes: !emptyWindow ? currentWindowData.packet_sizes_bytes.reduce((a, b) => a + b, 0) : 0,
      num_unique_packet_lengths: !emptyWindow ? [...new Set(currentWindowData.packet_sizes_bytes)].length : 0,
      num_unique_source_ips: !emptyWindow ? [...new Set(currentWindowData.source_ips)].length : 0,
      num_unique_dest_ips: !emptyWindow ? [...new Set(currentWindowData.dest_ips)].length : 0,
      num_unique_source_ports: !emptyWindow ? [...new Set(currentWindowData.source_ports)].length : 0,
      num_unique_dest_ports: !emptyWindow ? [...new Set(currentWindowData.dest_ports)].length : 0,
      tcp_perc: !emptyWindow && currentWindowData.numPackets !== 0 ? currentWindowData.num_tcp / currentWindowData.num_packets : 0,
      udp_perc: !emptyWindow && currentWindowData.numPackets !== 0 ? currentWindowData.num_udp / currentWindowData.num_packets : 0,
      icmp_perc: !emptyWindow && currentWindowData.numPackets !== 0 ? currentWindowData.num_icmp / currentWindowData.num_packets : 0,
      other_perc: !emptyWindow && currentWindowData.numPackets !== 0 ? currentWindowData.num_other / currentWindowData.num_packets : 0,
      perc_tcp_syn: !emptyWindow && currentWindowData.num_tcp !== 0 ? currentWindowData.of_tcp_syn / currentWindowData.num_packets : 0,
      perc_tcp_fin: !emptyWindow && currentWindowData.num_tcp !== 0 ? currentWindowData.of_tcp_fin / currentWindowData.num_packets : 0,
      perc_tcp_ack: !emptyWindow && currentWindowData.num_tcp !== 0 ? currentWindowData.of_tcp_ack / currentWindowData.num_packets : 0,
      perc_icmp_echo_reply: !emptyWindow && currentWindowData.num_icmp !== 0 ? currentWindowData.of_icmp_echo_reply / currentWindowData.num_packets : 0,
      perc_icmp_dest_unreachable: !emptyWindow && currentWindowData.num_icmp !== 0 ? currentWindowData.of_icmp_dest_unreachable / currentWindowData.num_packets : 0,
      avg_inter_packet_interval: !emptyWindow ? (currentWindowData.num_packets === 1 || currentWindowData.num_packets === 0 ? 0 : (currentWindowData.arrival_times[currentWindowData.arrival_times.length - 1] - currentWindowData.arrival_times[0]) / currentWindowData.arrival_times.length - 1) : 0,
      is_attack: attackType,
    }
    if (newWindowResult.perc_icmp_echo_reply > 0) {}
    return newWindowResult
  }

  updateAttackType(arrivalTime, attackTypes, currentAttackType) {
    // TODO: set currentAttackType here if multiple are specified
    if (attackTypes.length > 0) {
      // check if update required
      if (arrivalTime < attackTypes[0].start) {
        // no attack
        return {
          attackType: 0,
          attackTypes: attackTypes
        }
      } else if (arrivalTime >= attackTypes[0].start && arrivalTime <= attackTypes[0].end) {
        return {
          attackType: attackTypes[0].value,
          attackTypes: attackTypes
        }
      } else if (arrivalTime > attackTypes[0].end && attackTypes.length > 1) {
        attackTypes.shift()
        if (arrivalTime >= attackTypes[0].start && arrivalTime <= attackTypes[0].end) {
          return {
            attackType: attackTypes[0].value,
            attackTypes: attackTypes
          }
        } else {
          return {
            attackType: 0,
            attackTypes: attackTypes
          }
        }
      } else {
        return {
          attackType: 0,
          attackTypes: attackTypes
        }
      }
      return {
        attackType: currentAttackType,
        attackTypes: attackTypes
      }
    } // if not, regular proceess where type does not change
    return {
      attackType: currentAttackType,
      attackTypes: attackTypes
    }
  }

  getName() {
    return 'Feature Extraction for ML-Based DDoS Attack Detection'
  }

  async postParsingAnalysis() {
    var resultFiles = []

    console.log("finished");
    // multiple filenames for multiple file formats
    var fileName = `${this.baseOutPath}-ML-features.json`
    // var fileContent = this.result
    var fileContent = {
      // Signal and format to visualize as piechart
      linechart: {
        datasets: [{
          data: this.result.map(window => window.is_attack)
        }],
        labels: this.result.map(window => window.arrival_time)
      },
      options: {
        scaleStepWidth: 1,
        scaleStartValue: 0
      },
      hint: 'The labels of this chart have been computed using temporally sensitive data'
    }

    var summary = {
      fileName: fileName,
      attackCategory: 'Time-Based',
      analysisName: 'DDoS Attack-Type over Time',
      supportedDiagrams: ['LineChart']
    }
    // TODO: do this twice, once for csv for ml and once for json for vis
    resultFiles.push(await this.storeAndReturnResult(fileName, fileContent, summary))

    fileName = `${this.baseOutPath}-ML-features.csv`
    fileContent = this.result
    summary = {
      fileName: fileName,
      attackCategory: 'Time-Based',
      analysisName: 'DDoS Attack-Type over Time',
      supportedDiagrams: ['LineChart']
    }

    resultFiles.push(await this.storeAndReturnResult(fileName, fileContent, summary))

    return resultFiles
  }
}

module.exports = MachineLearningFeatureExtraction
