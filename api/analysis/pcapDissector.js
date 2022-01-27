import child_process from 'child_process';
const spawn = child_process.spawn
import path from 'path';

async function dissectAndUpload (pcapPath, ddosdbHost, token) {
  console.log('dissect start!', pcapPath)
  return new Promise(function (resolve, reject) {
    var programDir = path.resolve('../ddos_dissector/')
    var program = path.resolve(programDir, 'ddos_dissector.py')
    var args = [
      '-q',
      '-f', pcapPath,
      '--upload',
      '--host', ddosdbHost,
      '--authtoken', token
    ]
    console.log(program, args)
    var options = { cwd: programDir }

    var childProcess = spawn(program, args, options)
    childProcess.stdout.on('data', function (data) {
        console.log(`dissector stdout: ${data}`);
    })
    childProcess.stderr.on('data', function (data) {
        console.log(`dissector stderr: ${data}`);
    })
    childProcess.on('close', function (data) {
        console.log(`dissector exit code: ${data}`);
        resolve()
    })
  })
}

export default { dissectAndUpload };
