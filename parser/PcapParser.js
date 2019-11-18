var pcap = require('pcap')
var fs = require('fs')
var ipToAsn = require('ip-to-asn')

const maxNrOfIpsForWHOIS = 5000

class PcapParser {
  constructor () {
    this.whois = new ipToAsn()
    this.result = {
      packets: [],
      summary: {
        generic: {
          errors: [],
          computed: {},
          access: {},
          internet: {
            srcPrefixes: {},
            dstPrefixes: {},
            srcIps: {},
            dstIps: {},
          },
          transport: {
            srcPorts: {},
            dstPorts: {},
          },
          application: {
            protocols: {}
          }
        },
        visitors: {

        }
      }
    }
  }
  parseToJSON (filePath, title, outPath, summaryOutPath) {
    var pcap_session = pcap.createOfflineSession(filePath, '')
    pcap_session.on('packet', this.inspectPcapPacket.bind(this))
    pcap_session.on('complete', () => {
      this.analyseSrcIps()
      this.writeToFile(outPath, summaryOutPath)
    })
  }
  analyseSrcIps () {
    var nrOfSrcIps = Object.keys(this.result.summary.generic.internet.srcIps).length
    if (nrOfSrcIps < maxNrOfIpsForWHOIS) {
      this.whois.query(Object.keys(this.result.summary.generic.internet.srcIps), this.parseWhoisResult.bind(this))
    } else {
      console.warn(`Skipping src ip analysis since ${nrOfSrcIps} IPv4 addresses are too many for WHOIS`)
    }
  }
  parseWhoisResult (whoisError, whoisResult) {
    if (whoisError) {
      console.error('WHOIS query failed!')
    } else {
      console.log(whoisResult)
      for (var ip in whoisResult) {
        try {
          var result = whoisResult[ip]
          result.count = this.result.summary.generic.internet.srcIps[ip].count
          //this.result.summary.srcIps[ip] = whoisResult[ip]
          var allSrcPrefixes = this.result.summary.generic.internet.srcPrefixes
          if(allSrcPrefixes[result.range]) {
            allSrcPrefixes[result.range].count += result.count
          } else {
            allSrcPrefixes[result.range] = result
          }
        } catch(e) {
          console.log('Failed to update ', ip)
        }
      }
    }
  }
  writeToFile(outPath, summaryOutPath) {
    setTimeout(() => {
      fs.writeFile(outPath, JSON.stringify(this.result.packets), function (err) {
        if (err) {
          console.log(`Packet trace not able to write to ${outPath}`)
        }
        console.log('Written parsed network to ', outPath)
      })
      fs.writeFile(summaryOutPath, JSON.stringify(this.result.summary), function (err) {
        if (err) {
          console.log(`Summary not able to write to ${summaryOutPath}`)
        }
        console.log('Written capture summary to ', summaryOutPath)
      })
    }, 4000)
  }
  addOrIncrement (targetObject, property) {
    if (targetObject.hasOwnProperty(property)) {
      targetObject[property].count += 1
    } else {
      targetObject[property] = { count: 0 }
    }
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
      protocol: 'IPv4',
      source: ipv4Packet.saddr.addr.join('.'),
      destination: ipv4Packet.daddr.addr.join('.'),
      diffserv: ipv4Packet.diffserv,
      fragmentOffset: ipv4Packet.fragmentOffset,
      doNotFragment: ipv4Packet.flags.doNotFragment,
      moreFragments: ipv4Packet.flags.moreFragments,
      // TODO resolve
      protocol: ipv4Packet.protocol
    }

    this.addOrIncrement(this.result.summary.generic.internet.srcIps, potato.ip.source)
    this.addOrIncrement(this.result.summary.generic.internet.dstIps, potato.ip.destination)

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
      this.inspectUDPPacket(ipPacket.payload, potato)
    }
  }
  inspectTCPPacket (tcpPacket, potato) {
    potato.transport = {
      protocol: 'TCP',
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

    this.addOrIncrement(this.result.summary.generic.transport.srcPorts, potato.transport.sourcePort)
    this.addOrIncrement(this.result.summary.generic.transport.dstPorts, potato.transport.destinationPort)
    this.inspectApplicationLayerPacket(udpPacket.payload, udpPacket.dport)
  }
  inspectUDPPacket (udpPacket, potato) {
    potato.transport = {
      protocol: 'UDP',
      dataLength: udpPacket.length,
      sourcePort: udpPacket.sport,
      destinationPort: udpPacket.dport,
    }

    this.addOrIncrement(this.result.summary.generic.transport.srcPorts, potato.transport.sourcePort)
    this.addOrIncrement(this.result.summary.generic.transport.dstPorts, potato.transport.destinationPort)
    this.inspectApplicationLayerPacket(udpPacket.payload, potato, udpPacket.dport)
  }
  inspectApplicationLayerPacket (appPacket, potato, protocol) {
    this.addOrIncrement(this.result.summary.generic.application.protocols, protocol)
  }
}

module.exports = { PcapParser }
