import child_process from 'child_process';
const spawn = child_process.spawn
import path from 'path';

async function generateFilterAndUpload (projectPath, id, ddosdbHost, token) {
    console.log('converter start!', projectPath)
    await generate(projectPath, id)
    await upload(projectPath, id, ddosdbHost, token)
}

async function upload (projectPath, id, ddosdbHost, token) {
    return new Promise(function (resolve, reject) {
        var programDir = path.resolve('../converters/')
        var program = path.resolve(programDir, 'upload_filters.py')
        var filterFile = path.resolve(projectPath, `${id}.iptables`)
        var args = [
            '--authtoken', token,
            '--url', ddosdbHost,
            filterFile
        ]
        console.log(program, args, projectPath)
        var options = { cwd: projectPath }

        var childProcess = spawn(program, args, options)
        childProcess.stdout.on('data', function (data) {
            console.log(`uploader stdout: ${data}`);
        })
        childProcess.stderr.on('data', function (data) {
            console.log(`uploader stderr: ${data}`);
        })
        childProcess.on('close', function (data) {
            console.log(`uploader exit code: ${data}`);
            resolve()
            if(data === 0) { resolve() }
            if(data !== 0) { reject() }
        })
    })

}
async function generate (projectPath, id) {
    return new Promise(function (resolve, reject) {
        var programDir = path.resolve('../converters/')
        var program = path.resolve(programDir, 'converter_iptables.py')
        var fingerprint = path.resolve(projectPath, `${id}.json`)
        var args = [
            '-f', fingerprint
        ]
        console.log(program, args, projectPath)
        var options = { cwd: projectPath }

        var childProcess = spawn(program, args, options)
        childProcess.stdout.on('data', function (data) {
            console.log(`converter stdout: ${data}`);
        })
        childProcess.stderr.on('data', function (data) {
            console.log(`converter stderr: ${data}`);
        })
        childProcess.on('close', function (data) {
            console.log(`converter exit code: ${data}`);
            resolve()
            if(data === 0) { resolve() }
            if(data !== 0) { reject() }
        })
    })

}

export default { generateFilterAndUpload };
