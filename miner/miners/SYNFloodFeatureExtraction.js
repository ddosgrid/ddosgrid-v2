const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')

class SYNFloodFeatureExtraction extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.currentPacketTime
    this.windowLength = 1
    this.currentWindowData = {} // used while going through packets
    this.result = []
    // TIME BASED
    // syn ack ratio
    // num packets
    // num bytes
    // num source ips
    // num source ports
    // tcp ratio
    // udp ratio
    // num different packet lengths
    // num syn flag
    // num fin flag
    // num ack flag
    // num err packets
    // packet size (avg?)
    // inter packet interval
    // is_protocol
    // delta time
    // is attack?
    //
    //
    //
    //

  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp () {
    this.pcapParser.on('pcapPacket', this.handlePcap.bind(this))
    // this.pcapParser.on('complete', this.addLastWindow.bind(this))
  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  handlePcap (pcapPacket) {
    if (Object.keys(this.currentWindowData).length == 0) {
      // First packet, no window created yet

      // set global start time based off this packet
      this.currentPacketTime = pcapPacket.pcap_header.tv_sec
      this.currentWindowData = createNewWindowData(pcapPacket.pcap_header.tv_sec)

      this.currentWindowData = createFeatures(this.currentWindowData, pcapPacket)

    } else {
      // regular process
      if (pcapPacket.pcap_header.tv_sec - this.windowLength >= this.currentPacketTime) {
        // is new window required?
        var skippedwindows = false
        if (skippedwindows) {
          // have windows been skipped? some mod calc will do

          // fill empty windows and
          // add to results
        }
        // add currentWindow to results
        this.result.push(calculateWindowResult(this. currentWindowData, this.result.length))

        // create new window
        this.currentPacketTime = pcapPacket.pcap_header.tv_sec
        this.currentWindowData = createNewWindowData(pcapPacket.pcap_header.tv_sec)

        this.currentWindowData = createFeatures(this.currentWindowData, pcapPacket)
      } else {
        // window exists and not new interval

        this.currentWindowData = createFeatures(this.currentWindowData, pcapPacket)

      }
    }

    function calculateWindowResult(currentWindowData, windowNr) {
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
        of_tcp_syn: 0,
        of_tcp_fin: 0,
        of_tcp_ack: 0,
        avg_inter_packet_interval: 0,
        is_attack: 1,
      }
      return newWindowResult
    }

    function createNewWindowData(arrivalTime) {
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
        inter_packet_interval_times: [],
      }

      return newWindowData
    }

    function createFeatures(currentWindowData, pcapPacket) {
      currentWindowData.packet_sizes_bytes.push(pcapPacket.pcap_header.len)
      currentWindowData.num_packets += 1
      currentWindowData.size_bytes += pcapPacket.pcap_header.len
      currentWindowData.source_ips.push(pcapPacket.payload.payload.saddr.addr.join('.'))
      currentWindowData.source_ports.push(pcapPacket.payload.payload.payload.sport)
      currentWindowData.dest_ports.push(pcapPacket.payload.payload.payload.dport)

      if (pcapPacket.payload.payload.protocol === 6) {
        currentWindowData.num_tcp += 1
      }
      else if (pcapPacket.payload.payload.protocol === 17) {
        currentWindowData.num_udp += 1

      }
      else if (pcapPacket.payload.payload.protocol === 1) {
        currentWindowData.num_icmp += 1
      }
      else {
        currentWindowData.num_other += 1
      }

      return currentWindowData
    }
  }

  addLastWindow() {
    // add current window to results
    this.result.push(calculateWindowResult(this.result.length))

    function calculateWindowResult(windowNr) {
      var newWindowResult = {
        windowNr: windowNr,
        num_packets: 0,
        avg_packet_size: 0,
        num_bytes: 0,
        num_unique_packet_lengths: 0,
        num_unique_source_ips: 0,
        num_unique_source_ports: 0,
        perc_err_packets: 0,
        tcp_perc: 0,
        udp_perc: 0,
        other_perc: 0,
        of_tcp_syn: 0,
        of_tcp_fin: 0,
        of_tcp_ack: 0,
        avg_inter_packet_interval: 0,
        is_attack: 0,
      }
      return newWindowResult
    }
  }

  getName () {
    return 'Feature Extraction for ML-Based SYN-Flood DDoS Detection'
  }

  async postParsingAnalysis () {
    console.log("finished");
    var fileName = `${this.baseOutPath}-SYN-Flood-features.json`
    var fileContent = this.result
    var summary = {
      fileName: fileName,
      attackCategory: 'Network State',
      analysisName: 'IPv4 and IPv6 usage',
      supportedDiagrams: ['PieChart']
    }
    return await this.storeAndReturnResult(fileName, fileContent, summary)
  }
}

module.exports = SYNFloodFeatureExtraction
