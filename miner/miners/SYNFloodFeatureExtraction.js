const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser')

class SYNFloodFeatureExtraction extends AbstractPcapAnalyser {
  constructor (parser, outPath) {
    super(parser, outPath)
    this.currentPacketTime
    this.windowLength = 1
    this.currentWindow
    this.results = [
      {
        start_time: 0,
        num_packets: 0,
        num_unique_packet_lengths: 0,
        avg_packet_size:,
        num_bytes: 0,
        num_source_ips: 0,
        num_source_ports: 0,
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
    ]
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
    this.pcapParser.on('complete', this.addLastWindow.bind(this))

  }

  // Actual mining function
  // Post-analysis phase, do additional computation with the collected data and write it out
  handlePcap (pcapPacket) {
    if (Object.keys(this.currentWindow).length == 0) {
      // First packet, no window created yet

      // set global start time based off this packet
      // create new window obj and assign to current window

      // create features
    } else {
      if (pcapPacket.time - this.windowLength >= this.currentPacketTime) {
        // is new window required?
        if (skippedwindows) {
          // have windows been skipped?

          // fill empty windows
        } else {
          // add currentWindow to results

          // create new window
        }
      } else {
        // create features
      }
    }
  }

  addLastWindow() {
    // add current window to results
  }

  getName () {
    return 'Feature Extraction for ML-Based SYN-Flood DDoS Detection'
  }

  async postParsingAnalysis () {
    console.log("finished");
    var fileName = `${this.baseOutPath}-SYN-Flood-features.json`
    var fileContent = this.results
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
