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
    targetInterface: '',
    live: false
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

  var livePattern = /--live/
  var isLive = argv.some(param => param.match(livePattern))
  settings.live = isLive

  var ifParamPattern = /interface=(.*)/
  var ifParamGiven = argv.find(param => param.match(ifParamPattern))
  if(ifParamGiven) {
    var ifParam = ifParamGiven.match(ifParamPattern)[1]
    settings.targetInterface = ifParam
    var os = require('os')
    var interfaceExists = os.networkInterfaces().hasOwnProperty(ifParam)
    var nics = getNics()
    var interfaceExists = nics.includes(ifParam)
    
    if(!interfaceExists) {
      throw new Error(`The interface that was supplied (${ifParam}) does not exist!`)
    }
  }

  if(isLive && pcapFileParam) {
    throw new Error('An analysis may be either from interface or PCAP file')
  }


  return settings
}

function getNics () {
  var { execSync } = require('child_process')
  var std = execSync('ls /sys/class/net', { encoding: 'utf-8' })
  var interfaces = std.split('\n').filter(string => string.length > 0)
  return interfaces
}
