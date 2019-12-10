var path = require('path')
var PacketEmitter = require('../parser/PcapParser')
// Very large file - needs to be downloaded externally
var testfile = path.resolve(__dirname, 'testdata', 'maccdc2012_00004.pcap')

var emitter = new PacketEmitter(testfile)

testCompletion()
testFirstAndLast()

emitter.startPcapSession(testfile)

function testCompletion () {
    emitter.on('complete', function () {
        console.log('Test has completed')
    })
}

function testFirstAndLast () {
    var start, end;
   emitter.on('firstPcapPacket', function (packet) {
       console.log('Received the first packet:', packet)
       start = packet.pcap_header.tv_sec
   })
    emitter.on('lastPcapPacket', function (packet) {
        console.log('Received the last packet:', packet)
        end = packet.pcap_header.tv_sec
        console.log(`Attack duration: ${end - start} seconds.`)
    })
}
