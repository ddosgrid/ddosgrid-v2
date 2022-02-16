const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser');
const mathjs = require('mathjs')

class MachineLearningFeatureExtractionDoH extends AbstractPcapAnalyser {
  constructor(parser, outPath) {
    super(parser, outPath);
    this.result = [];
    this.flowNr = 0;
    this.totalTimes = [];
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp() {
    this.pcapParser.on('tcpSessionEnd', this.handleTCPSession.bind(this));
  }

  handleTCPSession (session) {
    this.flowNr++;
    this.totalTimes = this.getTotalTimes(session.send_packets, session.recv_packets);

    // Push into result
    console.log(this.createNewPacketData(session, this.flowNr, this.totalTimes));
    this.result.push(this.createNewPacketData(session, this.flowNr, this.totalTimes))
  }

  getTotalTimes(packets_sent, packets_received) {
    var totalTimes = [];
    Object.keys(packets_sent).forEach(function (key) {
      totalTimes.push(packets_sent[key]);
    });
    Object.keys(packets_received).forEach(function (key) {
      totalTimes.push(packets_received[key]);
    });
    return totalTimes
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
    let mode = mathjs.mode(packets[0]);
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

  getName() {
    return 'Feature Extraction for ML-Based Malicious DoH Traffic Detection'
  }

  createNewPacketData(session, flowNr, totalTimes) {
    var newPacketMiningData =  {
      flow_number: flowNr,
      source_IP: session.src,
      destination_IP: session.dst,
      source_port: this.getPortNr(session.src),
      destination_port: this.getPortNr(session.dst),
      duration: this.getDuration(session.connect_time, session.close_time),
      nr_flow_packets_sent: Object.keys(session.send_packets).length,
      nr_flow_packets_received: Object.keys(session.recv_packets).length,
      flow_bytes_sent: session.send_bytes_payload,
      flow_bytes_received: session.recv_bytes_payload,
      flow_sent_rate: this.computeRate(session.send_bytes_payload, this.getDuration(session.connect_time, session.close_time)),
      flow_received_rate: this.computeRate(session.recv_bytes_payload, this.getDuration(session.connect_time, session.close_time)),
      total_packet_length: session.send_bytes_payload + session.recv_bytes_payload,
    /*packet_length_mean: this.computeMean(packets),
      packet_length_median: this.computeMedian(packets),
      packet_length_mode: this.computeMode(packets),
      packet_length_standard_deviation: this.computeStandardDeviation(packets),
      packet_Length_variance: this.computeVariance(packets),
      packet_length_coefficient_of_variance: this.computeCoefficientOfVariance(packets),
      packet_length_skew_from_median: this.computeSkewFromMedian(packets),
      packet_Length_Skew_from_mode: this.computeSkewFromMode(packets),*/
      time_mean: this.computeMean(totalTimes),
      time_median: this.computeMedian(totalTimes),
      time_mode: this.computeMode(totalTimes),
      time_variance: this.computeVariance(totalTimes),
      time_standard_deviation: this.computeStandardDeviation(totalTimes),
      time_coefficient_of_variance: this.computeCoefficientOfVariance(totalTimes),
      time_skew_from_median: this.computeSkewFromMedian(totalTimes),
      time_skew_from_mode: this.computeSkewFromMode(totalTimes),
      /*request_mean: 0,
      request_median: 0,
      request_mode: 0,
      request_standard_deviation: 0,
      request_variance: 0,
      request_coefficient_of_variance: 0,
      request_skew_from_median: 0,
      request_skew_from_mode: 0,
      state:session.state,
     */
    };

    return newPacketMiningData
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
