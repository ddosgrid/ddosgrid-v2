const AbstractPcapAnalyser = require('./AbstractPCAPAnalyser');
const mathjs = require('mathjs');

class MachineLearningFeatureExtractionDoH extends AbstractPcapAnalyser {
  constructor(parser, outPath) {
    super(parser, outPath);
    this.result = [];
    this.flowNr = 0;
    // Training Data-Sets
    this.tsl1 = [];
    this.tsl2 = [];
  }

  // Setup phase, load additional databases, setup subscriptions and signal completion
  async setUp() {
    this.pcapParser.on('tcpSessionEnd', this.handleTCPSession.bind(this));
  }

  handleTCPSession (session) {
    this.flowNr++;
    let dohIPs = [
        "1.1.1.1",
        "8.8.4.4",
        "8.8.8.8",
        "9.9.9.9",
        "9.9.9.10",
        "9.9.9.11",
        "176.103.130.131",
        "176.103.130.130",
        "149.112.112.10",
        "149.112.112.112",
        "104.16.248.249",
        "104.16.249.249"
    ];
    if(dohIPs.includes(this.getIP(session.dst))){
      // Presorting: Check if TCP flow is also a HTTPS flow by checking one of the ports to be 443
      if(this.getPortNr(session.src) === "443" || this.getPortNr(session.dst) === "443") {
        // Push into result
        //console.log(this.createNewFlowData(session));
        this.result.push(this.createNewFlowData(session));
      }
    }
  }

  getTotalTimes(session) {
    let totalTimes = [];
    let packets_sent = session.send_packets;
    let packets_received = session.recv_packets;
    let acks_sent = session.send_acks;
    let acks_received = session.recv_acks;
    let packetTimes = [];

    Object.keys(packets_sent).forEach(function (key) {
      totalTimes.push(packets_sent[key]);
    });
    Object.keys(packets_received).forEach(function (key) {
      totalTimes.push(packets_received[key]);
    });
    Object.keys(acks_sent).forEach(function (key) {
      totalTimes.push(acks_sent[key]);
    });
    Object.keys(acks_received).forEach(function (key) {
      totalTimes.push(acks_received[key]);
    });
    if(totalTimes.length !== 0) {
      totalTimes.sort((a, b) => (a - b));
      let firstTime = totalTimes[0];
      for(let i=0;i<totalTimes.length;i++){
        packetTimes[i] = totalTimes[i]-firstTime;
      }
      return packetTimes
    }
    return 0
  }

  getTotalNumberOfPackets(session) {
    return Object.keys(session.send_packets).length + Object.keys(session.recv_packets).length + Object.keys(session.send_acks).length + Object.keys(session.recv_acks).length
  }

  getTotalPacketLength(session) {
    return session.send_bytes_ip + session.send_bytes_payload + session.send_bytes_tcp + session.recv_bytes_ip + session.recv_bytes_payload + session.recv_bytes_tcp
  }

  getIP(sessionIP) {
    return sessionIP.split(":")[0];
  }

  getPortNr(sessionPort) {
    return sessionPort.split(":").pop()
  }

  getDuration(connectTime, closeTime) {
    return closeTime-connectTime
  }

  getDurationSending(session){
    var timesSending = [];
    Object.keys(session.send_packets).forEach(function (key) {
      timesSending.push(session.send_packets[key])
    });
    Object.keys(session.send_acks).forEach(function (key) {
      timesSending.push(session.send_acks[key])
    });
    if(timesSending.length !== 0){
      return mathjs.max(timesSending)-mathjs.min(timesSending);
    }
    return 0
  }

  getDurationReceiving(session){
    var timesReceiving = [];
    Object.keys(session.recv_packets).forEach(function (key) {
      timesReceiving.push(session.recv_packets[key])
    });
    Object.keys(session.recv_acks).forEach(function (key) {
      timesReceiving.push(session.recv_acks[key])
    });
    if(timesReceiving.length !== 0) {
      return mathjs.max(timesReceiving)-mathjs.min(timesReceiving);
    }
    return 0
  }

  computeRate(nrOfBytes, duration) {
    if(nrOfBytes !== 0 && duration !== 0){
      return nrOfBytes/duration
    }
    return 0
  }

  computeMean(packets) {
    if(packets.length !== 0){
      return mathjs.mean(packets)
    }
    return 0
  }

  computeMedian(packets) {
    if(packets.length !== 0){
      return mathjs.median(packets)
    }
    return 0
  }

  computeMode(packets) {
    if(packets.length !== 0){
      return mathjs.mode(packets)[0]
    }
    return 0
  }

  computeStandardDeviation(packets) {
    if(packets.length !== 0){
      return mathjs.std(packets)
    }
    return 0
  }

  computeVariance(packets) {
    if(packets.length !== 0){
      return mathjs.variance(packets)
    }
    return 0
  }

  computeSkewFromMedian (packets) {
    if(packets.length !== 0){
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
    return 0
  }

  computeSkewFromMode (packets) {
    if(packets.length !== 0){
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
    return 0
  }

  computeCoefficientOfVariance(packets) {
    if(packets.length !== 0){
      let cov = -1;
      let mean = mathjs.mean(packets);

      if(mean !== 0) {
        cov = mathjs.std(packets)/mean * 100;
      }
      return cov
    }
    return 0
  }

  getTimesSent(session){
    var timesSent = [];
    Object.keys(session.send_packets).forEach(function (key) {
      timesSent.push(session.send_packets[key])
    });
    Object.keys(session.send_acks).forEach(function (key) {
      timesSent.push(session.send_acks[key])
    });
    if(timesSent.length !== 0) {
      return timesSent.sort((a, b) => (a - b));
    }
    return 0
  }

  getTimesReceived(session){
    var timesReceived = [];
    Object.keys(session.recv_packets).forEach(function (key) {
      timesReceived.push(session.recv_packets[key])
    });
    Object.keys(session.recv_acks).forEach(function (key) {
      timesReceived.push(session.recv_acks[key])
    });
    if(timesReceived.length !== 0) {
      return timesReceived.sort((a, b) => (a - b));
    }
    return 0
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

  createNewFlowData(session) {
    let totalTimes = this.getTotalTimes(session);
    let totalNrOfPackets = this.getTotalNumberOfPackets(session);
    let flowBytesSent = session.send_bytes_payload + session.send_bytes_ip + session.send_bytes_tcp;
    let flowBytesReceived = session.recv_bytes_payload + session.recv_bytes_ip + session.recv_bytes_tcp;
    let totalPacketLength = this.getTotalPacketLength(session);
    let timesSent = this.getTimesSent(session);
    let timesReceived = this.getTimesReceived(session);
    let requRecvDifference = this.getRequRespDifference(timesSent, timesReceived);

    let newFlowMiningData =  {
      // Trianing Data Layer 1
      doh: 1,
      //doh:0,
      // Training Data Layer 2
      //malicious: 1,
      malicious: 0,
      // Header Features
      source_IP: this.getIP(session.src),
      destination_IP: this.getIP(session.dst),
      source_port: this.getPortNr(session.src),
      destination_port: this.getPortNr(session.dst),
      duration: this.getDuration(session.connect_time, session.close_time),
      flow_bytes_sent: flowBytesSent,
      flow_bytes_received: flowBytesReceived,
      flow_sent_rate: this.computeRate(flowBytesSent, this.getDurationSending(session)),
      flow_received_rate: this.computeRate(flowBytesReceived, this.getDurationReceiving(session)),
      // Packet Length
      packet_length_mean: this.computeMean(session.total_packet_length),
      packet_length_median: this.computeMedian(session.total_packet_length),
      packet_length_mode: this.computeMode(session.total_packet_length),
      packet_length_standard_deviation: this.computeStandardDeviation(session.total_packet_length),
      packet_length_variation: this.computeVariance(session.total_packet_length),
      packet_length_coefficient_of_variation: this.computeCoefficientOfVariance(session.total_packet_length),
      packet_length_skew_from_median: this.computeSkewFromMedian(session.total_packet_length),
      packet_length_skew_from_mode: this.computeSkewFromMode(session.total_packet_length),
      // Packet Time
      packet_time_mean: this.computeMean(totalTimes),
      packet_time_median: this.computeMedian(totalTimes),
      packet_time_mode: this.computeMode(totalTimes),
      packet_time_variation: this.computeVariance(totalTimes),
      packet_time_standard_deviation: this.computeStandardDeviation(totalTimes),
      packet_time_coefficient_of_variation: this.computeCoefficientOfVariance(totalTimes),
      packet_time_skew_from_median: this.computeSkewFromMedian(totalTimes),
      packet_time_skew_from_mode: this.computeSkewFromMode(totalTimes),
      // Packet Request/ Response Time
      response_request_mean: this.computeMean(requRecvDifference),
      response_request_median: this.computeMedian(requRecvDifference),
      response_request_mode: this.computeMode(requRecvDifference),
      response_request_standard_deviation: this.computeStandardDeviation(requRecvDifference),
      response_request_variation: this.computeVariance(requRecvDifference),
      response_request_coefficient_of_variation: this.computeCoefficientOfVariance(requRecvDifference),
      response_request_skew_from_median: this.computeSkewFromMedian(requRecvDifference),
      response_request_skew_from_mode: this.computeSkewFromMode(requRecvDifference),
      // New Features
      state: this.getState(session.state),
      nr_flow_packets_sent: Object.keys(session.send_packets).length + Object.keys(session.send_acks).length,
      nr_flow_packets_received: Object.keys(session.recv_packets).length + Object.keys(session.recv_acks).length,
      nr_application_packets_sent: Object.keys(session.send_packets).length,
      nr_application_packets_received: Object.keys(session.recv_packets).length,
      nr_acks_sent: Object.keys(session.send_acks).length,
      nr_acks_received: Object.keys(session.recv_acks).length,
      nr_retrans_sent: Object.keys(session.send_retrans).length,
      nr_retrans_received: Object.keys(session.recv_retrans).length,
      total_packet_length: totalPacketLength,
      total_nr_of_packets_tcp_tracker: totalNrOfPackets,
      total_nr_of_packets_packet_length_handling: Object.keys(session.total_packet_length).length,
    };

    return newFlowMiningData
  }

  async postParsingAnalysis() {
    var resultFiles = [];

    // Output for ML classification
    //var fileName = `${this.baseOutPath}-ML-features-DoH.csv`;                 // Actual SecGrid Analysis
    var fileName = "Benign-DoH-Firefox-AdGuard.csv";                      // Test Data Analysis
    var fileContent = this.result;
    var summary = {
      fileName: fileName,
      attackCategory: 'Malicious DoH Traffic Classification',
      analysisName: 'DoH Traffic Analysis',
      supportedDiagrams: []
    };
    //resultFiles.push(await this.storeAndReturnResult(fileName, fileContent, summary));

    // Test Data Analysis
    const fs = require('fs');
    const path = "./Benign-DoH-Firefox-AdGuard.csv";
    const jsonexport = require('jsonexport');
    jsonexport(fileContent, function(err, csv) {
      if (err) return(err);

      if(!fs.existsSync(path)) {
        fs.writeFile(fileName, csv, 'utf8', function (err) {
          if (err) {
            console.err(`Error writing file ${fileName}.`);
            reject(err)
          }
        })
      } else if (fs.existsSync(path)) {
        fs.appendFile(fileName, csv, function (err) {
          if (err) {
            console.err(`Error writing file ${fileName}.`);
            reject(err)
          }
        })
      }
    });

    return resultFiles
  }
}

module.exports = MachineLearningFeatureExtractionDoH;
