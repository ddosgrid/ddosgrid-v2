var pcap = require('pcap')
var fs = require('fs')
var ipToAsn = require('ip-to-asn')

class PcapParser {
  constructor () {
    this.whois = new ipToAsn()
    this.result = {
      packets: [],
      summary: {
        errors: [],
        srcIps: {},
        dstIps: {},
        srcPorts : {},
        dstPorts: {},
      }
    }
  }
  parseToJSON (filePath, title, outPath, summaryOutPath) {
    var pcap_session = pcap.createOfflineSession(filePath, '')
    pcap_session.on('packet', this.inspectPcapPacket.bind(this))
    pcap_session.on('complete', () => {
      this.writeToFile(outPath, summaryOutPath)
    })
  }
  writeToFile(outPath, summaryOutPath) {
    fs.writeFile(outPath, JSON.stringify(this.result.packets), function (err) {
      if(err) {
        console.log(`Packet trace not able to write to ${outPath}`)
      }
      console.log('Written parsed network to ', outPath)
    })
    fs.writeFile(summaryOutPath, JSON.stringify(this.result.summary), function (err) {
      if(err) {
        console.log(`Summary not able to write to ${summaryOutPath}`)
      }
      console.log('Written capture summary to ', summaryOutPath)
    })
  }
  addOrIncrement (targetObject, property) {
    if (targetObject.hasOwnProperty(property)) {
      targetObject[property].count += 1
    } else {
      targetObject[property] = { count: 0 }
      //this.analyseAndAdd(property, targetObject)
    }
  }
  analyseAndAdd (ip, targetObject) {
    console.log('analysing:', ip)
    this.whois.query(ip, function (res) {
      console.log(res)
      targetObject[ip] = res
      targetObject[ip].count = 1
    })
  }
  inspectPcapPacket (rawPcapPacket) {
    var parsedPacket = pcap.decode(rawPcapPacket)
    var etherPacket = parsedPacket.payload
    var potato = {
      id: parsedPacket.id,
      pcap: {
        totalLength: parsedPacket.pcap_header.len,
        date_s: parsedPacket.pcap_header.tv_sec,
        date_usec: parsedPacket.pcap_header.tv_usec
      }
    }
    this.result.packets.push(potato)
    this.inspectEthPacket(etherPacket, potato)
  }
  inspectEthPacket (etherPacket, potato) {
    var ipPacket = etherPacket.payload
    // We are not interested in Ethernet - so we will just pass the packet and potato on
    potato.eth = {

    }
    this.inspectIPPacket(ipPacket, potato)
  }
  inspectIPPacket (ipPacket, potato) {
    if(ipPacket.version === 4) {
      this.inspectIPv4Packet(ipPacket, potato)
    } else if (ipPacket.version === 6) {
      this.inspectIPv6Packet(ipPacket, potato)
    }
  }
  inspectIPv4Packet (ipv4Packet, potato) {
    console.log(`Packet from ${ipv4Packet.saddr.addr} to ${ipv4Packet.daddr.addr}`)
    potato.ip = {
      source: ipv4Packet.saddr.addr.join('.'),
      destination: ipv4Packet.daddr.addr.join('.'),
      diffserv: ipv4Packet.diffserv,
      fragmentOffset: ipv4Packet.fragmentOffset,
      doNotFragment: ipv4Packet.flags.doNotFragment,
      moreFragments: ipv4Packet.flags.moreFragments,
      // TODO resolve
      protocol: ipv4Packet.protocol
    }

    this.addOrIncrement(this.result.summary.srcIps, potato.ip.source)
    this.addOrIncrement(this.result.summary.dstIps, potato.ip.destination)

    var protocol = ipv4Packet.protocol
    this.inspectTransportPacket(ipv4Packet, protocol, potato)
  }
  inspectIPv6Packet (ipv6Packet, potato) {
    var protocol = ipv6Packet.nextHeader
    this.inspectTransportPacket(ipv6Packet, protocol, potato)
  }
  inspectTransportPacket (ipPacket, protocol, potato) {
    if (protocol === 6) {
      this.inspectTCPPacket(ipPacket.payload, potato)
    } else if (protocol === 17) {
      this.inspectTCPPacket(ipPacket.payload, potato)
    }
  }
  inspectTCPPacket (tcpPacket, potato) {
    potato.transport = {
      ackno: tcpPacket.ackno,
      //data: tcpPacket.data,
      flags: tcpPacket.flags,
      dataLength: tcpPacket.dataLength,
      sourcePort: tcpPacket.sport,
      destinationPort: tcpPacket.dport,
      seq: tcpPacket.seqno,
      urgent: tcpPacket.urgentPointer,
      windowSize: tcpPacket.windowSize
    }

    this.addOrIncrement(this.result.summary.srcPorts, potato.transport.sourcePort)
    this.addOrIncrement(this.result.summary.dstPorts, potato.transport.destinationPort)
  }
  inspectUDPPacket (udpPacket, potato) {}
  inspectApplicationLayerPacket (appPacket, potato) {}
}

module.exports = { PcapParser }
