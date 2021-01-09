const child_process = require('child_process')
const fork = child_process.fork
const path = require('path')

async function analyseFileInProjectFolder (pcapPath, attackType) {
  return new Promise(function (resolve, reject) {
    var program = path.resolve('../miner/index.js')
    var args = [ `pcap_path=${pcapPath}`,
                `attack_type=${attackType}` ]
    var options = { stdio: [ 'ipc' ] }

    var childProcess = fork(program, args, options)
    childProcess.on('message', function (minerResults) {
      var parsed = JSON.parse(minerResults)
      resolve(parsed)
    })
    childProcess.on('exit', (code) => {
      console.log('Miner process has exited with: ', code)
      if(code !== 0) {
        reject('Miner was unable to parse the file')
      }
    })
  })
}

module.exports = { analyseFileInProjectFolder }
