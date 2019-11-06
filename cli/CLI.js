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
    aggregate: false,
    extractMetaInf: false
  }

  var pcap_file_param_pattern = /pcap_path=(.*)/
  var pcap_file_param = argv[2].match(pcap_file_param_pattern)

  if (pcap_file_param) {
    var filePath = pcap_file_param[1]
    if (fs.existsSync(filePath)) {
      settings.pcapPath = filePath
      settings.pcapFile = path.basename(filePath)
    } else {
      console.error('Provided pcap file doesnt exist!')
    }
  }

  return settings
}
