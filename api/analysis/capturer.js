import child_process from "child_process";
import path from "path";
const fork = child_process.fork

class Capturer {
    constructor() {
        this.liveCaptures = {

        }
    }

    noteAnalysis(id, process) {
        this.liveCaptures[id] = {
            process: process,
            results: null
        }
    }


    startCapture(id, targetInterface) {
        var program = path.resolve('../miner/index.js')
        var args = [ `interface=${targetInterface}`, '--live' ]
        var options = { stdio: [ 'ipc' ] }

        var childProcess = fork(program, args, options)
        this.noteAnalysis(id, childProcess)
    }

    async stopCapture(id) {
        return new Promise((resolve, reject) => {
            var capture = this.liveCaptures[id]
            var childProcess = capture.process
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
            childProcess.kill()
        })
    }

}

export default Capturer;
