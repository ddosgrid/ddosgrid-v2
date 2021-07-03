var fs = require('fs')
var TZSPParser = require('./TZSPDecapsulation')

var parser = new TZSPParser()

var outputFile = fs.createWriteStream('./tzsp_example.pcap')

parser.registerWritableStream(outputFile)
parser.openDataGramSocket()

console.log('TZSP analyzer listening on UDP port 37008 - stream TZSP encapsulated to this socket')

const oneMinute = 60 * 1000

process.on('SIGTERM', () => {
  console.log('Closing socket...')
  parser.closeDataGramSocket()
})
process.on('SIGINT', () => {
  console.log('Closing socket...')
  parser.closeDataGramSocket()
})
