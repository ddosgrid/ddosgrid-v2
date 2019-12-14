const path = require('path')
const { Router } = require('express')
const router = Router()
const fs = require('fs')
const pcapAnalyser = require('./pcapAnalyser')

const analysisBaseDir = path.resolve(__dirname, '../../data/public/analysis/')

router.post('/upload', handleFilePost)
router.post('/:id/analyse', startAnalysis)

function startAnalysis (req, res) {
  var id = req.params.id
  if (!id) {
    res.status(404).send('ID not supplied')
  }
  var filePath = path.resolve(analysisBaseDir, id, `${id}.pcap`)
  try {
    fs.statSync(filePath)
  } catch (e) {
    res.status(404).send('ID unknown')
  }
  res.status(200).send({
    id: id,
    status: 'File was found, analysis should start'
  })
  var projectPath = path.resolve(analysisBaseDir, id, `${id}.pcap`)
  var filename = `${id}.pcap`
  pcapAnalyser.analyseFileInProjectFolder(projectPath, filename)
}




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
