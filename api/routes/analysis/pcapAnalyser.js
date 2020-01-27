const child_process = require('child_process')
const fork = child_process.fork
const path = require('path')

async function analyseFileInProjectFolder (pcapPath, filter) {
  return new Promise(function (resolve, reject) {
    var program = path.resolve('../miner/index.js')
    if (filter) {
      var args = [ `pcap_path=${pcapPath}`, `capture_filter=${filter}` ]
    } else {
      var args = [ `pcap_path=${pcapPath}` ]
    }
    console.log(args)
    var options = { stdio: [ 'ipc' ] }

    var childProcess = fork(program, args, options)
    childProcess.on('error', ()=>  { console.log(arguments) })
    childProcess.on('exit', (code) => {
      console.log('Miner process has exited with: ', code)
      if(code !== 0) {
        reject('Miner was unable to parse the file')
      }
    })
  })
}

module.exports = { analyseFileInProjectFolder }
