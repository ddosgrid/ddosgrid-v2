const path = require('path')
const { Router } = require('express')
const router = Router()

const analysisBaseDir = path.resolve(__dirname, '../../public/analysis/')

router.post('/upload', handleFilePost)

function handleFilePost (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No file was uploaded');
  }
  if (req.files.length > 1) {
    return res.status(400).send('Only one file can be uploaded at a time');
  }

  var uploadedFile = req.files.captureFile
  if(!uploadedFile) {
    return res.status(400).send('Please upload file with form key "captureFile"');
  }
  var fileHash = uploadedFile.md5
  uploadedFile.mv(path.resolve(analysisBaseDir, fileHash, `${fileHash}.pcap`), mvHandler)

  function mvHandler (err) {
    if (err) {
      return res.status(500).send('Error uploading/moving file')
    }
    return res.status(200).json({
      id: fileHash,
      status: `You're file was uploaded with ID ${fileHash}`
    })
  }
}

module.exports = router
