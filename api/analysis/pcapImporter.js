const https = require('https');
const crypto = require('crypto')
const fs = require('fs');
const DDoSDBHOST = process.env.DDOSDB_HOST || 'www.csg.uzh.ch'
const ATTACKTRACE_ENDPOINT = process.env.DDOSDB_ATTACKTRACE_PATH || '/ddosgrid/ddosdb/api/attack-trace'

module.exports = { importFileByID }

async function importFileByID (datasetID, access_token) {
    return new Promise((resolve, reject) => {
        const randID = Math.random() * 1e17
        const hash = crypto.createHash('sha256');
        const file = fs.createWriteStream(`./tmp/imported-dataset-${randID}.pcap`);
        var options = {
            path: `${ATTACKTRACE_ENDPOINT}/${datasetID}`,
            host: DDoSDBHOST,
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        }
        https.get(options, function(response) {
            response.pipe(file)
            response.pipe(hash).setEncoding('hex')
            response.on('end', () => {
                resolve({
                    fileHash: hash.read(),
                    fileSizeInMB: Number(file.bytesWritten / 1024 / 1024).toFixed(3),
                    file: file
                })
            })
            response.on('error', (e) => { reject(e) })
        }).on('error', (e) => { reject(e) });
    })
}