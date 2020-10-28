var srcIps = new Set()
var dstIps = new Set()
var srcPorts = new Set()
var dstPorts = new Set()

var nrOfSrcPorts = 0
var nrOfDstPorts = 0

var nrOfIPpackets = 0
var nrOfSrcIps = 0
var nrOfDstIps = 0

process.on('message', function (m) {
  const messageType = m.type
  if (messageType === 'ippacket') {
    m.packet.forEach((ipPacket) => {
      nrOfIPpackets++
      try {
        var srcAddr = ipPacket.split('@')[0]
        var dstAddr = ipPacket.split('@')[1]
        if (!srcIps.has(srcAddr)) {
          srcIps.add(srcAddr)
          nrOfSrcIps++
        }
        if (!dstIps.has(dstAddr)) {
          dstIps.add(dstAddr)
          nrOfDstIps++
        }
      } catch (e) {
        //console.log('Unable to process IP packet:', ipPacket)
      }

    })
  }
  if (messageType === 'tppacket') {

    try {
      var transportPacket = m.packet
      transportPacket.forEach((transportPacket) => {
        var srcPort = transportPacket.split('@')[0]
        var dstPort = transportPacket.split('@')[1]
        if (!dstPorts.has(dstPort)) {
          dstPorts.add(dstPort)
          nrOfDstPorts++
        }
        if (!srcPorts.has(srcPort)) {
          srcPorts.add(srcPort)
          nrOfSrcPorts++
        }
      })
    } catch (e) {
      //console.log('Unable to process transport-level packet:', transportPacket)
    }
  }
  if (messageType === 'postanalysis') {
    process.send({
      srcIps,
      dstIps,
      srcPorts,
      dstPorts,

      nrOfSrcPorts,
      nrOfDstPorts,

      nrOfIPpackets,
      nrOfSrcIps,
      nrOfDstIps
    })
  }
  return true
})
