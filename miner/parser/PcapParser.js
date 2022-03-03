const EventEmitter = require('events')
const pcap = require('./pcap')
const portNumbers = require('port-numbers')
const colors = require('colors')
const dns = require('pcap/decode/dns')

// Change to true if you want to know about every unsupported frame
const verbose = false
const experimentalFeatures = false

class PacketEmitter extends EventEmitter {
  constructor () {
    super()
    this.firstPacket = true
    this.attacksSupplied = false
    this.currentPcapPacket = undefined
    this.pcapPacketCounter = 0
    this.progressPrintCounter = 0
    this.dnsdecoder = new dns()
    this.attackType = 0;
    this.startedTCPSessions = {};
  }

  startPcapSession (pcapPath, attackType = 0) {
    // TCP
    this.tcp_tracker = new pcap.TCPTracker();
    //
    this.pcap_session = pcap.createOfflineSession(pcapPath, '');
    this.attackType = attackType;
    this.pcap_session.on('packet', (packet) => {
      this.inspectPcapPacket(packet)
    })
    this.pcap_session.on('complete', () => {
      this.emit('lastPcapPacket', this.currentPcapPacket);
      this.emit('complete');

      //TCP
      for (let key in this.startedTCPSessions) {
        this.startedTCPSessions[key].forceCloseThisSession();
        this.emit('tcpSessionEnd', this.startedTCPSessions[key]);
      }

      //this.startedTCPSessions.forEach(session => session.forceCloseThisSession())
    });
    // TCP
    this.tcp_tracker.on('session', (session) => {
      this.startedTCPSessions[session.src] = session;
      //console.log("Start of session between " + session.src_name + " and " + session.dst_name);
      this.emit('tcpSessionStart', session);
      session.on('end', (session) => {
        //console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
        this.emit('tcpSessionEnd', session);
        delete this.startedTCPSessions[session.src];
      })
    })
    //
  }

  inspectPcapPacket (pcapPacket) {
    this.emit('rawPcapPacket', pcapPacket)
    this.pcapPacketCounter++
    this.printProgress()

    try {
      var decodedPacket = pcap.decode(pcapPacket)
      this.tcp_tracker.track_packet(decodedPacket)
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
    if(this.currentPcapPacket.link_type === 'LINKTYPE_ETHERNET' || this.currentPcapPacket.link_type === "LINKTYPE_LINUX_SLL") {
      var ethernetPacket = decodedPacket.payload
      this.inspectLinkPacket(ethernetPacket, decodedPacket.linktype)
    } else {
      console.warn('DDoSGrid only supports Ethernet on L1!')
      console.warn(`Dropping packet with link_type: ${this.currentPcapPacket.link_type}`)
    }
  }

  inspectLinkPacket (linkPacket, linkType) {
    if (linkType === 'LINKTYPE_ETHERNET') {
      this.emit('ethernetPacket', linkPacket)
    } else if (linkType === 'LINKTYPE_LINUX_SLL') {
      this.emit('sllPacket', linkPacket)
    }

    var etherType = linkPacket.ethertype

    var etherTypeARP = 2054
    var etherTypeIPv4 = 2048
    var etherTypeIPv6 = 34525
    var etherTypeNoPayload = 0

    if (etherType === etherTypeARP) {
      var arpPacket = linkPacket.payload
      this.inspectARPPacket(arpPacket)
    } else if (etherType === etherTypeIPv4 || etherType === etherTypeIPv6) {
      var ipPacket = linkPacket.payload
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
    if (ipProtocolField === 6) {
      this.emit('transportPacket', transportPacket)
      this.inspectTCPPacket(transportPacket)
      if(transportPacket.dport === 179) {
        //console.log('BGP!')
      }
      this.tryGuessApplicationPacket(transportPacket.dport, transportPacket.data)
      this.tryGuessApplicationPacket(transportPacket.sport, transportPacket.data)
    } else if (ipProtocolField === 17) {
      this.emit('transportPacket', transportPacket)
      this.inspectUDPPacket(transportPacket)
      this.tryGuessApplicationPacket(transportPacket.dport, transportPacket.data)
      this.tryGuessApplicationPacket(transportPacket.sport, transportPacket.data)
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
      if (guessedServicename.name === 'http') {
        this.tryNaiveHttpParse(packet)
      } else if (guessedServicename.name === 'bgp') {
        this.decodeBGP(packet)
      } else if(guessedServicename.name === 'domain') {
        this.decodeDNS(packet)
      } else {
        this.emit(`${guessedServicename.name}Packet`, packet)
      }
    } catch (e) {
      if (verbose) {
        console.error(`Unable to parse service name from port ${port}`)
      }
    }
  }

  decodeDNS (packet) {
    if (experimentalFeatures) {
      var dnspack = this.dnsdecoder.decode(packet, 0)
      this.emit('dnsPacket', dnspack)
    }
  }

  decodeBGP (packet) {
    try {
      var bgpdec = require('pcap/decode/bgp')
      var decoder = new bgpdec()
      var pac = decoder.decode(packet, 0)
      this.emit('bgpPacket', pac)
    }
    catch (e) {
      console.log('s')
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

  printProgress () {
    var anim = ['◴','◷','◶','◵']
    if (this.pcapPacketCounter % 1000000 === 0 || this.pcapPacketCounter === 1000) {
      var icon = anim[this.progressPrintCounter % 4]
      this.flushStdout()
      var heapUsage = process.memoryUsage().heapTotal / 1024 / 1024
      var formattedMemUsage = heapUsage.toFixed() + 'MB'
      if (heapUsage < 1000) {
        var coloredMemUsage = formattedMemUsage.black.bgGreen
      } else if (heapUsage < 2000) {
        var coloredMemUsage = formattedMemUsage.black.bgYellow
      } else {
        var coloredMemUsage = formattedMemUsage.black.bgRed
      }
      process.stdout.write(`\t${icon}  ${this.pcapPacketCounter / 1e6} × 10⁶ PCAP packets analysed. Current Heap Memory usage: ${coloredMemUsage}`);
      this.progressPrintCounter++
    }
  }
  flushStdout () {
    try {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
    } catch (e) {}
  }
}

module.exports = PacketEmitter
