const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser');
const mathjs = require('mathjs');

class MachineLearningFeatureExtractionDoH extends AbstractPcapAnalyser {
  constructor(parser, outPath) {
    super(parser, outPath);
    this.result = [];
    this.flowNr = 0;
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp() {
    this.pcapParser.on('tcpSessionEnd', this.handleTCPSession.bind(this));
  }

  handleTCPSession (session) {
    this.flowNr++;

    // Presorting: Check if TCP flow is also a HTTPS flow by checking one of the ports to be 443
    //if(this.getPortNr(session.src) === "443" || this.getPortNr(session.dst) === "443") {
      // Push into result
      console.log(this.createNewPacketData(session, this.flowNr));
      this.result.push(this.createNewPacketData(session, this.flowNr))
    //}
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

  getTotalNumberOfPackets(session) {
    return Object.keys(session.send_packets).length + Object.keys(session.recv_packets).length + Object.keys(session.send_acks).length + Object.keys(session.recv_acks).length
  }

  getTotalPacketLength(session) {
    return session.send_bytes_ip + session.send_bytes_payload + session.send_bytes_tcp + session.recv_bytes_ip + session.recv_bytes_payload + session.recv_bytes_tcp
  }

  getPortNr(sourcePort) {
    return sourcePort.split(":").pop()
  }

  getDuration(connectTime, closeTime) {
    return closeTime-connectTime
  }

  getDurationSending(session){
    var timesOneSide = [];
    Object.keys(session.send_packets).forEach(function (key) {
      timesOneSide.push(session.send_packets[key])
    });
    Object.keys(session.send_acks).forEach(function (key) {
      timesOneSide.push(session.send_acks[key])
    });
    return mathjs.max(timesOneSide)-mathjs.min(timesOneSide);
  }

  getDurationReceiving(session){
    var timesOneSide = [];
    Object.keys(session.recv_packets).forEach(function (key) {
      timesOneSide.push(session.recv_packets[key])
    });
    Object.keys(session.recv_acks).forEach(function (key) {
      timesOneSide.push(session.recv_acks[key])
    });
    return mathjs.max(timesOneSide)-mathjs.min(timesOneSide);
  }

  computeRate(nrOfBytes, duration) {
    return nrOfBytes/duration
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
      cov = mathjs.std(packets)/mean * 100;
    }
    return cov
  }

  getTimesSent(session){
    var timesOneSide = [];
    Object.keys(session.send_packets).forEach(function (key) {
      timesOneSide.push(session.send_packets[key])
    });
    Object.keys(session.send_acks).forEach(function (key) {
      timesOneSide.push(session.send_acks[key])
    });
    return timesOneSide;
  }

  getTimesReceived(session){
    var timesOneSide = [];
    Object.keys(session.recv_packets).forEach(function (key) {
      timesOneSide.push(session.recv_packets[key])
    });
    Object.keys(session.recv_acks).forEach(function (key) {
      timesOneSide.push(session.recv_acks[key])
    });
    return timesOneSide;
  }

  getRequRespDifference(timesSent, timesReceived) {
    var requRespDifference = [];

    for(let i=0; i<timesSent.length; i++) {
      for(let j=0; j<timesReceived.length; j++) {
        if(timesReceived[j]>timesSent[i] && timesReceived[j]<timesSent[i+1]) {
          requRespDifference.push(timesReceived[j]-timesSent[i]);
        }
      }
    }
    return requRespDifference
  }

  getState(state) {
    if(state === "CLOSED") {
      return 1
    } else {
      return 0
    }
  }

  getName() {
    return 'Feature Extraction for ML-Based Malicious DoH Traffic Detection'
  }

  createNewPacketData(session, flowNr) {
    let totalTimes = this.getTotalTimes(session.send_packets, session.recv_packets);
    let totalNrOfPackets = this.getTotalNumberOfPackets(session);
    let flowBytesSent = session.send_bytes_payload + session.send_bytes_ip + session.send_bytes_tcp;
    let flowBytesReceived = session.recv_bytes_payload + session.recv_bytes_ip + session.recv_bytes_tcp;
    let totalPacketLength = this.getTotalPacketLength(session);
    let timesSent = this.getTimesSent(session);
    let timesReceived = this.getTimesReceived(session);
    let requRecvDifference = this.getRequRespDifference(timesSent, timesReceived);

    let newPacketMiningData =  {
      flow_number: flowNr,
      source_IP: session.src,
      destination_IP: session.dst,
      source_port: this.getPortNr(session.src),
      destination_port: this.getPortNr(session.dst),
      state: this.getState(session.state),
      duration: this.getDuration(session.connect_time, session.close_time),
      nr_flow_packets_sent: Object.keys(session.send_packets).length + Object.keys(session.send_acks).length,
      nr_flow_packets_received: Object.keys(session.recv_packets).length + Object.keys(session.recv_acks).length,
      total_nr_of_packets: totalNrOfPackets,
      flow_bytes_sent: flowBytesSent,
      flow_bytes_received: flowBytesReceived,
      flow_sent_rate: this.computeRate(flowBytesSent, this.getDurationSending(session)),
      flow_received_rate: this.computeRate(flowBytesReceived, this.getDurationReceiving(session)),
      nr_acks_sent: Object.keys(session.send_acks).length,
      nr_acks_received: Object.keys(session.recv_acks).length,
      nr_application_packets_sent: Object.keys(session.send_packets).length,
      nr_application_packets_received: Object.keys(session.recv_packets).length,
      nr_retrans_sent: Object.keys(session.send_retrans).length,
      nr_retrans_received: Object.keys(session.recv_retrans).length,
      total_packet_length: totalPacketLength,
      packet_length_mean: this.computeMean(session.total_packet_length),
      packet_length_median: this.computeMedian(session.total_packet_length),
      packet_length_mode: this.computeMode(session.total_packet_length),
      packet_length_standard_deviation: this.computeStandardDeviation(session.total_packet_length),
      packet_length_variance: this.computeVariance(session.total_packet_length),
      packet_length_coefficient_of_variance: this.computeCoefficientOfVariance(session.total_packet_length),
      packet_length_skew_from_median: this.computeSkewFromMedian(session.total_packet_length),
      packet_length_skew_from_mode: this.computeSkewFromMode(session.total_packet_length),
      time_mean: this.computeMean(totalTimes),
      time_median: this.computeMedian(totalTimes),
      time_mode: this.computeMode(totalTimes),
      time_variance: this.computeVariance(totalTimes),
      time_standard_deviation: this.computeStandardDeviation(totalTimes),
      time_coefficient_of_variance: this.computeCoefficientOfVariance(totalTimes),
      time_skew_from_median: this.computeSkewFromMedian(totalTimes),
      time_skew_from_mode: this.computeSkewFromMode(totalTimes),
      response_request_mean: this.computeMean(requRecvDifference),
      response_request_median: this.computeMedian(requRecvDifference),
      response_request_mode: this.computeMode(requRecvDifference),
      response_request_standard_deviation: this.computeStandardDeviation(requRecvDifference),
      response_request_variance: this.computeVariance(requRecvDifference),
      response_request_coefficient_of_variance: this.computeCoefficientOfVariance(requRecvDifference),
      response_request_skew_from_median: this.computeSkewFromMedian(requRecvDifference),
      response_request_skew_from_mode: this.computeSkewFromMode(requRecvDifference),
      extracted_packets_packet_length_handling: Object.keys(session.total_packet_length).length,
      //DoH: 1,
      //malicious: 1;
    };

    return newPacketMiningData
  }

  async postParsingAnalysis() {
    var resultFiles = [];

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
