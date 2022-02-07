const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser');

class MachineLearningFeatureExtractionDoH extends AbstractPcapAnalyser {
  constructor(parser, outPath) {
    super(parser, outPath);
    this.currentPacketData = {};
    this.result = [];
    this.totalPacketLength = 0;
    this.counter = 0;
    this.output = {
      nrOfTCPFlows: 0
    }
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp() {
    this.pcapParser.on('pcapPacket', this.handlePcap.bind(this));
    this.pcapParser.on('tcpSessionStart', this.counttcpSessions.bind(this));
    this.pcapParser.on('complete', this.addLastPacketData.bind(this))
  }

  handlePcap(pcapPacket) {
    this.currentPacketLengthBytes = pcapPacket.pcap_header.len;
    this.currentPacketData = this.createNewPacketData(this.currentPacketLengthBytes);
    this.totalPacketLength += this.currentPacketLengthBytes;
    this.counter += 1;
    this.result.push(this.computeNewPacketMiningData(this.currentPacketData, this.counter, this.totalPacketLength))
  }

  getName() {
    return 'Feature Extraction for ML-Based Malicious DoH Detection'
  }

  createNewPacketData(packetLengthBytes) {
    var newPacketMiningData =  {
      packet_length_bytes: packetLengthBytes
    };

    return newPacketMiningData
  }

  addLastPacketData() {
    this.result.push(this.computeNewPacketMiningData(this.currentPacketData, this.counter, this.totalPacketLength));
    this.result = this.result.filter(window => window.packet_number)
  }

  computeNewPacketMiningData(currentPacketData, packetNumber, totalPacketLength) {
    var newPacketMiningData = {
      packet_length_bytes: currentPacketData.packet_length_bytes,
      packet_number: packetNumber,
      total_packet_length: totalPacketLength

    };
    if (newPacketMiningData.perc_icmp_echo_reply > 0){}
    return newPacketMiningData
  }

  // Checking for TCP Sessions
  counttcpSessions () {
    this.output.nrOfTCPFlows++
  }

  async postParsingAnalysis() {
    var resultFiles = [];
    console.log(this.output.nrOfTCPFlows);

    // Output for ML classification
    var fileName = `${this.baseOutPath}-ML-features-DoH.csv`;
    var fileContent = this.result;
    var summary = {
      fileName: fileName,
      attackCategory: 'Malicious DoH Traffic Classification',
      analysisName: 'DoH Traffic Analysis',
      supportedDiagrams: []
    };
    resultFiles.push(await this.storeAndReturnResult(fileName, fileContent, summary));

    return resultFiles
  }
}

module.exports = MachineLearningFeatureExtractionDoH;
