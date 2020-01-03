const child_process = require('child_process')
const fork = child_process.fork
const path = require('path')

async function analyseFileInProjectFolder (pcapPath) {
  return new Promise(function (resolve, reject) {
    var program = path.resolve('../miner/index.js')
    var args = [`pcap_path=${pcapPath}`]
    var options = { stdio: ['ipc'] }

    var childProcess = fork(program, args, options)
    childProcess.on('message', function (msg) {
      var result = JSON.parse(msg)
      resolve(result)
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
