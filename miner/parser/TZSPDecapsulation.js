const dgram = require('dgram')
const { Writable } = require('stream')
const BinaryProtocol = require('binary-protocol');

const protocol = new BinaryProtocol();

var c = 0

class TZSPParser {
  constructor (port=37008, addr='0.0.0.0', writeAsPCAP=true) {
    this.port = port
    this.addr = addr
    this.status = 'closed'
    this.server = null
    // Note whether we decapsulate TZSP and transform to PCAP format or not
    this.writeAsPCAPToWriteStream = writeAsPCAP
    // Clients may pass 1 to N writable streams where decapsulated packets
    // can be retrieved from
    this.writeStreams = []
    this.nrOfPacksCaptured = 0
  }

  registerWritableStream (writeStream) {
    var isWritableStream = writeStream instanceof Writable
    if(!isWritableStream){
      throw new Error('Input is either not a stream or not writable!')
      return
    }
    this.writeStreams.push(writeStream)

    if(this.writeAsPCAPToWriteStream) {
      // If the user wishes PCAP format we first write the global PCAP header before transforming
      // each packet into a PCAP record
      writePapHeader(writeStream)
    }
  }

  async openDataGramSocket () {
    // TODO: Check and update status
    this.server = dgram.createSocket('udp4')

    return new Promise((res, rej) => {
      this.server.on('error', function errorOnBind (err) {
        console.log('Unable to create datagram socket')
        server.close()
        rej(err)
      })

      this.server.on('message', datagramReceived.bind(this))

      function datagramReceived (msg) {
        this.nrOfPacksCaptured++
        printProgress(this.nrOfPacksCaptured)
        this.decapsulateAndWrite(msg)
      }
      this.server.bind(this.port, this.addr, () => {
        console.log(`Datagram socket listening on port ${this.port}`)
        res()
      })
    })
  }

  closeDataGramSocket () {
    console.log(`→ Captured ${this.nrOfPacksCaptured} packets`)
    this.server.close()
    this.writeStreams.forEach(closeStream)

    function closeStream (stream) {
      stream.end()
    }
  }

  decapsulateAndWrite (datagram) {
    var decapsulated = this.decapsulate(datagram)
    this.writeStreams.forEach(writeDecapsulated)

    function writeDecapsulated (stream) {
      stream.write(decapsulated)
    }
  }

  decapsulate (TZSPMessage) {
    // TODO implement tzsp decoder to PCAP if configured to do so
    var tzsp = decodeTZSP(TZSPMessage)
    if(tzsp.protocol !== 1) {
      console.log('Unsupported encapsulation protocol ', tzsp.protocol)
    }
    var now = Date.now()
    var writer = protocol.createWriter();
    var seconds = parseInt(now / 1000)
    var microseconds = (now - parseInt(now / 1000) * 1000) * 1000 
    var capturedLength = tzsp.packet.length
    var actualLength = tzsp.packet.length // TOOD: Verify
    writer.Int32LE(seconds)
          .Int32LE(microseconds)
          .Int32LE(capturedLength)
          .Int32LE(actualLength)
    var pcapPack = Buffer.concat([
      writer.buffer,
      tzsp.packet
    ])
    return pcapPack
  }
}

function decodeTZSP (message) {
  const tagEndType = 1
  // Process Header
  var version = message.readUInt8(0)
  var type = message.readUInt8(1)
  var encapsulatedProto = message.readUInt16BE(2)
  // Process Tagged Fields
  var offset = 4
  var tagType = message.readUInt8(offset)
  var tags = [ tagType ]
  if(tagType === tagEndType) {
    // console.log('No additional tags')
  }
  while (tagType !== tagEndType) {
    tagType = message.readUInt8(++offset)
    tags.push(tagType)
    var tagLength = message.readUInt8(++offset)
    offset += tagLength
  }
  // Tag End was encountered
  var encapsulated = message.slice(++offset)
  return {
    version: version,
    type: type,
    protocol: encapsulatedProto,
    packet: encapsulated
  }

  // Process Encapsulated Packet
}

function writePapHeader (stream) {
  // Write 4byte magic number
  stream.write(Buffer.from('A1B2C3D4', 'hex').reverse())
  var writer = protocol.createWriter();
  writer.Int16LE(2)         // 2 byte major version
        .Int16LE(4)         // 2 byte minor version
        .Int32LE(0)         // 4 byte timezone offset
        .Int32LE(0)         // 4 byte time accuracy
        .Int32LE(65535)     // 4 byte maximum packet length captured
        .Int32LE(1)         // 4 byte link-layer protocol number
  var buff = writer.buffer
  console.log(`→ Wrote ${buff.length} bytes global PCAP header`)
  stream.write(buff)
}

function printProgress (nr) {
  if(nr % 10 === 0) {
    process.stdout.write(`→ ${nr} packets decapsulated\r`);
  }
}
module.exports = TZSPParser
