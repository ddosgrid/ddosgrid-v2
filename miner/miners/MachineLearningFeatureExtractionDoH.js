const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser');
const mathjs = require('mathjs')

class MachineLearningFeatureExtractionDoH extends AbstractPcapAnalyser {
  constructor(parser, outPath) {
    super(parser, outPath);
    this.currentPacketData = {};
    this.result = [];
    this.totalPacketLength = 0;
    this.counter = 0;
    this.output = {
      nrOfTCPFlows: 0,
      sourceIP: 0,
      destinationIP: 0,
      sourcePort: 0,
      destinationPort: 0,
      duration: 0,
      nrFlowPacketsSent: 0,
      nrFlowPacketsReceived: 0,
      flowBytesSent: 0,
      flowBytesReceived: 0,
      flowSentRate: 0,
      flowReceivedRate: 0,
      totalPacketLength: 0,
      packetLengthMean: 0,
      packetLengthMedian: 0,
      packetLengthMode: 0,
      packetLengthStandardDeviation: 0,
      packetLengthVariance: 0,
      packetLengthCoefficientOfVariance: 0,
      packetLengthSkewFromMedian: 0,
      packetLengthSkewFromMode: 0,
      timeMean: 0,
      timeMedian: 0,
      timeMode: 0,
      timeVariance: 0,
      timeStandardDeviation: 0,
      timeCoefficientOfVariance: 0,
      timeSkewFromMedian: 0,
      timeSkewFromMode: 0,
      requestMean: 0,
      requestMedian: 0,
      requestMode: 0,
      requestStandardDeviation: 0,
      requestVariance: 0,
      requestCoefficientOfVariance: 0,
      requestSkewFromMedian: 0,
      requestSkewFromMode: 0,
      state: 0,
    }
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp() {
    //this.pcapParser.on('pcapPacket', this.handlePcap.bind(this));
    this.pcapParser.on('tcpSessionEnd', this.handleTCPSession.bind(this));
    this.pcapParser.on('complete', this.addLastPacketData.bind(this))
  }

  handleTCPSession (session) {
    this.output.nrOfTCPFlows++;
    this.totalPacketLength = session.send_bytes_payload + session.recv_bytes_payload;
    this.totalPacketNr = Object.keys(session.send_packets).length + Object.keys(session.recv_packets).length;

    // computing the metrics
    this.output.sourceIP = session.src;
    this.output.destinationIP = session.dst;
    this.output.sourcePort = this.getPortNr(session.src);
    this.output.destinationPort = this.getPortNr(session.dst);
    this.output.duration = this.getDuration(session.connect_time, session.close_time);
    this.output.state = session.state;
    this.output.nrFlowPacketsSent = Object.keys(session.send_packets).length;
    this.output.nrFlowPacketsReceived = Object.keys(session.recv_packets).length;
    this.output.flowBytesSent = session.send_bytes_payload;
    this.output.flowBytesReceived = session.recv_bytes_payload;
    this.output.flowSentRate = this.computeRate(session.send_bytes_payload, Object.keys(session.send_packets).length)
    this.output.flowReceivedRate = this.computeRate(session.recv_bytes_payload, Object.keys(session.recv_packets).length)
    this.output.totalPacketLength = session.send_bytes_payload + session.recv_bytes_payload;
    /*this.output.packetLengthMean = this.computeMean(packets);
    this.output.packetLengthMedian = this.computeMedian(packets);
    this.output.packetLengthMode = this.computeMode(packets);
    this.output.packetLengthStandardDeviation = this.computeStandardDeviation(packets);
    this.output.packetLengthVariance = this.computeVariance(packets);
    this.output.packetLengthCoefficientOfVariance = this.computeCoefficientOfVariance(packets);
    this.output.packetLengthSkewFromMedian = this.computeSkewFromMedian(packets);
    this.output.packetLengthSkewFromMode = this.computeSkewFromMode(packets);
     */

    // Push into result
    this.result.push(this.output)
  }

  getPortNr(sourcePort) {
    return sourcePort.split(":").pop()
  }

  getDuration(connectTime, closeTime) {
    return closeTime-connectTime
  }

  computeRate(nrOfBytes, nrOfPackets) {
    return nrOfBytes/nrOfPackets
  }

  computeMean(packets) {
    return mathjs.mean(packets)
  }

  computeMedian(packets) {
    return mathjs.median(packets)
  }

  computeMode(packets) {
    return mathjs.mode(packets)[0]
  }

  computeStandardDeviation(packets) {
    return mathjs.std(packets)
  }

  computeVariance(packets) {
    return mathjs.variance(packets)
  }

  computeSkewFromMedian (packets) {
    let mean = mathjs.mean(packets);
    let median = mathjs.median(packets);
    let dif = 3 * (mean - median);
    let std = mathjs.std(packets);
    let skew = -10;

    if(std !== 0){
      skew = dif/std;
    }

    return skew
  }

  computeSkewFromMode (packets) {
    let mean = mathjs.mean(packets);
    let mode = mathjs.mode(packets);
    let dif = mean - mode;
    let std = mathjs.std(packets);
    let skew = -10;

    if(std !== 0){
      skew = dif/std;
    }

    return skew
  }

  computeCoefficientOfVariance(packets) {
    let cov = -1;
    let mean = mathjs.mean(packets);

    if(mean !== 0) {
      cov = mathjs.std(packets)/mean;
    }

    return cov
  }

  handlePcap(pcapPacket) {
    this.currentPacketLengthBytes = pcapPacket.pcap_header.len;
    this.currentPacketData = this.createNewPacketData(this.currentPacketLengthBytes);
    this.totalPacketLength += this.currentPacketLengthBytes;
    this.counter++;
    this.result.push(this.computeNewPacketMiningData(this.currentPacketData, this.counter, this.totalPacketLength))
  }

  getName() {
    return 'Feature Extraction for ML-Based Malicious DoH Traffic Detection'
  }

  createNewPacketData(packetLengthBytes) {
    var newPacketMiningData =  {
      packet_length_bytes: packetLengthBytes
    };

    return newPacketMiningData
  }

  addLastPacketData() {
    this.result.push(this.output);
    //this.result = this.result.filter(window => window.packet_number)
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

    console.log(this.output)

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
