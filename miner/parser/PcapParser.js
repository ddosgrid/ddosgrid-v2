const EventEmitter = require('events')
const pcap = require('pcap')
const portNumbers = require('port-numbers')

class PacketEmitter extends EventEmitter {
    constructor () {
        super()
        this.firstPacket = true
        this.currentPcapPacket = undefined
    }
    startPcapSession (pcapPath) {
        this.pcap_session = pcap.createOfflineSession(pcapPath, '')
        this.pcap_session.on('packet', (packet) => {
            this.inspectPcapPacket(packet)
        })
        this.pcap_session.on('complete', () => {
/*          this.analyseSrcIps()
            this.analyseComputedValues()
            this.writeToFile(outPath, outPath)*/
            this.emit('lastPcapPacket', this.currentPcapPacket)
            this.emit('complete')
        })
    }
    inspectPcapPacket (pcapPacket) {
        this.emit('rawPcapPacket', pcapPacket)

        var decodedPacket = pcap.decode(pcapPacket)
        this.emit('pcapPacket', decodedPacket)

        if(this.firstPacket) {
            // Emit the first pcap packet
            this.emit('firstPcapPacket', decodedPacket)
            this.firstPacket = false
        }
        // Store the current packet 'globally' so that it can be used in other events, e.g. 'completed'
        this.currentPcapPacket = decodedPacket

        var ethernetPacket = decodedPacket.payload
        this.inspectEthernetPacket(ethernetPacket)
    }
    inspectEthernetPacket (ethernetPacket) {
        this.emit('ethernetPacket', ethernetPacket)

        var ipPacket = ethernetPacket.payload
        this.inspectIPPacket(ipPacket)
    }
    inspectIPPacket (ipPacket) {
        this.emit('ipPacket', ipPacket)
        if(ipPacket) {
            try {
                if (ipPacket.version === 4) {
                    this.inspectIPv4Packet(ipPacket)
                } else if (ipPacket.version === 6) {
                    this.inspectIPv6Packet(ipPacket)
                }
            } catch (e) {
                console.error('Unable to parser IP version: ', e)
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
            this.tryGuessApplicationPacket(transportPacket.dport)
        } else if (ipProtocolField === 17) {
            this.inspectUDPPacket(transportPacket)
            this.tryGuessApplicationPacket(transportPacket.dport)
        } else if (ipProtocolField === 1) {
            this.inspectICMPPacket(transportPacket)
        }
    }
    inspectTCPPacket (tcpPacket) {
        this.emit('tcpPacket', tcpPacket)

        var applicationPacket = tcpPacket.payload
        this.inspectApplicationPacket(applicationPacket)
    }
    inspectUDPPacket (udpPacket) {
        this.emit('udpPacket', udpPacket)

        var applicationPacket = udpPacket.payload
        this.inspectApplicationPacket(applicationPacket)
    }
    inspectApplicationPacket (applicationPacket) {
        this.emit('applicationPacket', applicationPacket)

    }
    tryGuessApplicationPacket (port) {
        try {
            var guessedServicename = portNumbers.getService(port)
            this.emit(`${guessedServicename}Packet`, port)
        } catch (e) {
            console.error(`Unable to parse service name from port ${port}`)
        }
    }
    inspectICMPPacket (icmpPacket) {
        this.emit('icmpPacket', icmpPacket)
    }

}

module.exports = PacketEmitter
