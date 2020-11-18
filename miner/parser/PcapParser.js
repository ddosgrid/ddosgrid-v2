const EventEmitter = require('events')
const pcap = require('pcap')
const portNumbers = require('port-numbers')

// Change to true if you want to know about every unsupported frame
const verbose = false

class PacketEmitter extends EventEmitter {
  constructor () {
    super()
    this.firstPacket = true
    this.attacksSupplied = false
    this.currentPcapPacket = undefined
    this.attackType = 0
  }

  startPcapSession (pcapPath, attackType = 0) {
    this.pcap_session = pcap.createOfflineSession(pcapPath, '')
    this.attackType = attackType
    this.pcap_session.on('packet', (packet) => {
      this.inspectPcapPacket(packet)
    })
    this.pcap_session.on('complete', () => {
      this.emit('lastPcapPacket', this.currentPcapPacket)
      this.emit('complete')
    })
  }

  inspectPcapPacket (pcapPacket) {
    this.emit('rawPcapPacket', pcapPacket)

    try {
      var decodedPacket = pcap.decode(pcapPacket)
    } catch (e) {
      if (verbose) {
        console.log('Unable to decode packet', e.message)
      }
      return
    }
    if (this.attackType !== 0 && !this.attacksSupplied) {
      this.emit('setAttackTypes', this.attackType)
      this.attacksSupplied = true
    }
    this.emit('pcapPacket', decodedPacket)

    if (this.firstPacket) {
      // Emit the first pcap packet
      this.emit('firstPcapPacket', decodedPacket, this.attackType)
      this.firstPacket = false
    }
    // Store the current packet 'globally' so that it can be used in other events, e.g. 'completed'
    this.currentPcapPacket = decodedPacket

    if(this.currentPcapPacket.link_type === 'LINKTYPE_ETHERNET') {
      var ethernetPacket = decodedPacket.payload
      this.inspectEthernetPacket(ethernetPacket)
    } else {
      console.warn('DDoSGrid only supports Ethernet on L1!')
      console.warn(`Dropping packet with link_type: ${this.currentPcapPacket.link_type}`)
    }
  }

  inspectEthernetPacket (ethernetPacket) {
    this.emit('ethernetPacket', ethernetPacket)

    var etherType = ethernetPacket.ethertype

    var etherTypeARP = 2054
    var etherTypeIPv4 = 2048
    var etherTypeIPv6 = 34525
    var etherTypeNoPayload = 0

    if (etherType === etherTypeARP) {
      var arpPacket = ethernetPacket.payload
      this.inspectARPPacket(arpPacket)
    } else if (etherType === etherTypeIPv4 || etherType === etherTypeIPv6) {
      var ipPacket = ethernetPacket.payload
      this.inspectIPPacket(ipPacket)
    } else if (etherType === etherTypeNoPayload) {
      // Don't emit anything more that the ethernet packet since there is not payload!
    } else {
      if (verbose) {
        console.warn(`Ethernet packet contains a payload packet (EtherType ${etherType}) for which there is no dedicated handler.`)
      }
    }
  }

  inspectARPPacket (arpPacket) {
    this.emit('arpPacket', arpPacket)
  }

  inspectIPPacket (ipPacket) {
    this.emit('ipPacket', ipPacket)
    if (ipPacket) {
      try {
        if (ipPacket.version === 4) {
          this.inspectIPv4Packet(ipPacket)
        } else if (ipPacket.version === 6) {
          this.inspectIPv6Packet(ipPacket)
        }
      } catch (e) {
        console.error('Unable to parse IP version: ', e)
      }
    }
  }

  inspectIPv4Packet (ipv4Packet) {
    this.emit('ipv4Packet', ipv4Packet)

    var transportPacket = ipv4Packet.payload
    this.inspectTransportPacket(transportPacket, ipv4Packet.protocol)
  }

  inspectIPv6Packet (ipv6Packet) {
    this.emit('ipv6Packet', ipv6Packet)

    var transportPacket = ipv6Packet.payload
    this.inspectTransportPacket(transportPacket, ipv6Packet.protocol)
  }

  inspectTransportPacket (transportPacket, ipProtocolField) {
    this.emit('transportPacket', transportPacket)

    if (ipProtocolField === 6) {
      this.inspectTCPPacket(transportPacket)
      this.tryGuessApplicationPacket(transportPacket.dport, transportPacket.data)
    } else if (ipProtocolField === 17) {
      this.inspectUDPPacket(transportPacket)
      this.tryGuessApplicationPacket(transportPacket.dport, transportPacket.data)
    } else if (ipProtocolField === 1) {
      this.inspectICMPPacket(transportPacket)
    }
  }

  inspectTCPPacket (tcpPacket) {
    this.emit('tcpPacket', tcpPacket)

    var applicationPacket = tcpPacket.data
    this.inspectApplicationPacket(applicationPacket)
  }

  inspectUDPPacket (udpPacket) {
    this.emit('udpPacket', udpPacket)

    var applicationPacket = udpPacket.data
    this.inspectApplicationPacket(applicationPacket)
  }

  inspectApplicationPacket (applicationPacket) {


    if (applicationPacket) {
      this.emit('applicationPacket', applicationPacket)
    }
  }

  tryGuessApplicationPacket (port, packet) {
    try {
      var guessedServicename = portNumbers.getService(port)
      this.emit(`${guessedServicename.name}Packet`, packet)
      if (guessedServicename.name === 'http') {
        this.tryNaiveHttpParse(packet)
      }
    } catch (e) {
      if (verbose) {
        console.error(`Unable to parse service name from port ${port}`)
      }
    }
  }

  tryNaiveHttpParse (packet) {
    try {
      var httpString = Buffer.from(packet).toString('utf-8')
      var lines = httpString.split('\r\n')
      if (lines.length > 1) {
        var verbAndEndpoint = lines[0]
        var userAgentLine = lines.find(line => line.startsWith('User-Agent: '))

        // Or just trim off the start to get the raw useragent string. Might perform better.
        var userAgent = userAgentLine.match('^User-Agent: (.+)')[1]
        var endpoint = verbAndEndpoint.match('^(GET|POST) (.+) HTTP')[2]
        var verb = verbAndEndpoint.match('^(GET|POST) (.+) HTTP')[1]

        this.emit('httpVerb', verb)
        this.emit('httpEndpoint', endpoint)
        this.emit('httpUserAgent', userAgent)
      }
    } catch (e) {
    }
  }

  inspectICMPPacket (icmpPacket) {
    this.emit('icmpPacket', icmpPacket)
  }
}

module.exports = PacketEmitter
