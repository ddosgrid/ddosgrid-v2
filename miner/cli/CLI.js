const fs = require('fs')
const path = require('path')

module.exports = { parseAndCheckArguments }

function parseAndCheckArguments (argv) {
  if (argv.length === 2) {
    console.error('Supply at least the pcap file..')
    process.exit(1)
  }

  var settings = {
    pcapPath: '',
    pcapFile: '',
    attackType: 0
  }

  if (argv.length === 4) {
    var attackTypeParamPattern = /attack_type=(.*)/
    var attackTypeParam = argv[3].match(attackTypeParamPattern)

    if (attackTypeParam) {
      if (typeof attackTypeParam[1] === undefined) {
        throw new Error('Invalid attack type specified!')
      }
      settings.attackType = attackTypeParam[1]
    }
  }

  var pcapFileParamPattern = /pcap_path=(.*)/
  var pcapFileParam = argv[2].match(pcapFileParamPattern)

  if (pcapFileParam) {
    var filePath = pcapFileParam[1]
    if (fs.existsSync(filePath)) {
      settings.pcapPath = filePath
      settings.pcapFile = path.basename(filePath)
    } else {
      throw new Error('Provided pcap file doesnt exist!')
    }
  }

  return settings
}
