var pcap = require('pcap')

class PcapParser {
  constructor () {
    this.result = {
      packets: [],
      summary: {
        errors: [],
        srcIps: [],
        dstIps: [],
        srcPorts : [],
        dstPorts: [],
      }
    }
  }
  parseToJSON (filePath, title, outPath) {
    var pcap_session = pcap.createOfflineSession(filePath, '')
    pcap_session.on('packet', this.inspectPcapPacket.bind(this))
    pcap_session.on('end', () => { this.writeToFile(outPath) })
  }
  writeToFile(outPath) {
    console.log(`Writing the following analysis to ${outPath}`)
    console.table(this.result.packets)
    console.log(this.result.summary)
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
      destination: ipv4Packet.saddr.addr.join('.'),
      diffserv: ipv4Packet.diffserv,
      fragmentOffset: ipv4Packet.fragmentOffset,
      doNotFragment: ipv4Packet.flags.doNotFragment,
      moreFragments: ipv4Packet.flags.moreFragments,
      // TODO resolve
      protocol: ipv4Packet.protocol
    }
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
      data: tcpPacket.data,
      flags: tcpPacket.flags,
      dataLength: tcpPacket.dataLength,
      sourcePort: tcpPacket.sport,
      destinationPort: tcpPacket.dport,
      seq: tcpPacket.seqno,
      urgent: tcpPacket.urgentPointer,
      windowSize: tcpPacket.windowSize
    }

    console.log(this.result)
  }
  inspectUDPPacket (udpPacket, potato) {}
  inspectApplicationLayerPacket (appPacket, potato) {}
}

module.exports = { PcapParser }
