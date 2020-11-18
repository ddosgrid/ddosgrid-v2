const fs = require('fs')
const path = require('path')

module.exports = {
  parseAndCheckArguments
}

function parseAndCheckArguments(argv) {
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
      var parsedAttackType = parseAttackType(attackTypeParam)
      settings.attackType = parsedAttackType
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
  console.log(settings.attackType);
  return settings
}


function parseAttackType(attackTypeParam) {
  if (typeof attackTypeParam[1] === undefined) {
    throw new Error('Invalid attack type specified!')
  }
  if (!(attackTypeParam[1].includes(':') || attackTypeParam[1].includes(','))) {
    return parseInt(attackTypeParam[1])
  } else {
    var segments = attackTypeParam[1].split(',')
    var segmentObjects = segments.map(function(segmentString) {
      var segmentObj = {}
      segment = segmentString.split(':')
      segmentObj.start = segment[0]
      segmentObj.end = segment[1]
      segmentObj.value = parseInt(segment[2])
      return segmentObj
    })
    return segmentObjects
  }
}
