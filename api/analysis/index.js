const path = require('path')
const bodyParser = require('body-parser')
const { Router } = require('express')
const router = Router()
const fs = require('fs')
const pcapDissector = require('./pcapDissector')
const pcapFilterGen = require('./pcapFilterGenerator')
const pcapAnalyser = require('./pcapAnalyser')
const Capturer = require('./capturer')
const persistedAnalyses =  require('./persistence')
const fileImport = require('./pcapImporter')

const analysisBaseDir = path.resolve(__dirname, '../data/public/analysis/')
const analysesDB = path.resolve(__dirname, '../data/anyleses.db')
var analyses = new persistedAnalyses(analysesDB)

var liveCapture = new Capturer()

const { protect } = require('../auth/index')

router.get('', protect, getAllAnalyses)
router.get('/:id', protect, getAnalysisById)
router.delete('/:id', protect, deleteAnalysisById)
router.post('/upload', protect, handleFilePost)
router.post('/import/:dataset', protect, bodyParser.json(), handleFileImport)
router.put('/import/:dataset', protect, bodyParser.json(), handleFileImport)
router.post('/:id/analyse', protect, startAnalysis)
router.post('/capture', protect, startCapture)
router.post('/capture/:id/close', protect, closeCapture)

async function getAllAnalyses (req, res) {
    try {
      var all = await analyses.getAnalysesOfUser(req.user._id)
      res.json(all)
    } catch (e) {
      res.send(500)
    }
}

async function getAnalysisById (req, res) {
  // TODO: Check if user the uploader
  var analysis = await analyses.getAnalysis(req.params.id)
  res.json(analysis)
}

async function deleteAnalysisById (req, res) {
  try {
    var analysis = await analyses.getAnalysis(req.params.id)
    if(!analysis) {
      return res.status(404).send('Not found')
    }
    // We need to derive the directory from the database md5 hash
    // since reading it from parameter would be dangerous
    var pathToDel = path.resolve(analysisBaseDir, analysis.md5)
    try {
      deleteFilesInDir(pathToDel)
    } catch (e) {
      console.log('Unable to remove files associated with dataset ' + req.params.id)
    }
    await analyses.deleteAnalysis(req.params.id)
    res.status(200).send(`Deleted ${analysis.md5}`)
  } catch (e) {
    console.log(e)
    res.status(400).send('Unable to delete analysis')
  }
}

async function startAnalysis (req, res) {
  var id = req.params.id
  var exportToDB = req.query.export === "true" || false
  if (!id) {
    return res.status(404).send('ID not supplied')
  }
  var filePath = path.resolve(analysisBaseDir, id, `${id}.pcap`)
  try {
    fs.statSync(filePath)
  } catch (e) {
    return res.status(404).send('ID unknown')
  }
  var analysis = await analyses.getAnalysis(id)
  if(!analysis) {
    return res.status(404).send('File was found but no corresponding database entry. Check upload?')
  }
  var analysisRequestedByUploader = req.user._id === analysis.uploader
  if(!analysisRequestedByUploader) {
    return res.status(403).send('Unauthorized to start analysis on a dataset that was uploaded with different account')
  }
  var analysed = analysis.status !== 'uploaded' && analysis.status !== 'failed'
  if(analysed) {
    if(analysis.status === 'analysed') {
      return res.status(400).send('Analysis has already been performed')
    }
    if(analysis.status === 'in progress') {
      return res.status(400).send('Analysis is already running')
    }
  }

  res.status(200).send({
    id: id,
    status: 'File was found, analysis should start'
  })
  var projectPath = path.resolve(analysisBaseDir, id)
  var projectPathPCAP = path.resolve(projectPath, `${id}.pcap`)
  var startTime = new Date()
  if(exportToDB) {
    analyses.changeExportStatus(id, 'in progress')
    try {
      var dissectorResult = await pcapDissector.dissectAndUpload(projectPathPCAP, process.env.DDOSDB_PCAPEXPORT, req.user.accesstoken)
      analyses.changeExportStatus(id, 'exported')

      try {
        analyses.changeFilterGenStatus(id, 'in progress')
        var filterGenResult = await pcapFilterGen.generateFilterAndUpload(projectPath, id, process.env.DDOSDB_FILTEREXPORT, req.user.accesstoken)
        analyses.changeFilterGenStatus(id, 'generated')

      } catch (e) {
        analyses.changeFilterGenStatus(id, 'failed')
        console.warn('Dissector failed!', e)
      }

    } catch (e) {
      analyses.changeExportStatus(id, 'failed')
      console.warn('Dissector failed!', e)
    }
  } else {
    analyses.changeExportStatus(id, 'opt-out')
    analyses.changeFilterGenStatus(id, 'opt-out')
  }
  try {
    analyses.changeAnalysisStatus(id, 'in progress')
    var analysisResult = await pcapAnalyser.analyseFileInProjectFolder(projectPathPCAP)
    var endTime = new Date()
    var analysisDurationInSeconds = (endTime - startTime) / 1000

    var metrics = analysisResult.find(el => el.analysisName === 'Miscellaneous Metrics').metrics

    analyses.changeAnalysisStatus(id, 'analysed')
    analyses.appendMetrics(id, metrics)
    analyses.storeAnalysisDuration(id, analysisDurationInSeconds)

    var results = analysisResult
    results.forEach(result => {
      try {
        result.file = path.relative(analysisBaseDir, result.fileName)
      } catch (e) {
        console.warn('Unable to find analysisFile from fileName:', result.fileName)
      }
    })
    var validResults = results.filter(result  => {
      try {
        return result.analysisName.length > 0
            && result.file.length > 0
            && result.attackCategory.length > 0
            && Array.isArray(result.supportedDiagrams)
      } catch (e) {
        return false
      }
    })
    var cleanedResults = validResults.map(keepRequiredAttributes)
    var resultsWithHash = cleanedResults.map((el) => addHash(el, id))
    analyses.addAnalysisFiles(id, cleanedResults)
  } catch (e) {
    analyses.changeAnalysisStatus(id, 'failed')
  }
}

async function startCapture (req, res) {
  if (!req.body.name) {
    return res.status(400).send('Name missing to create live capture')
  }
  if (!req.body.description) {
    return res.status(400).send('Description missing to create live capture')
  }
  if (!req.body.targetinterface) {
    return res.status(400).send('Interface missing to create live capture')
  }

  var analysisID = `live-analysis-${req.body.targetinterface}-${Date.now()}`
  var datasetName = req.body.name
  var datasetDescription = req.body.description
  var uploader = req.user._id
  var fileSizeInMB = -1

  analyses.createAnalysis(analysisID, datasetName, datasetDescription, fileSizeInMB, uploader)
  liveCapture.startCapture(analysisID, req.body.targetinterface)
  analyses.changeAnalysisStatus(analysisID, 'Live capturing')
  var startTime = new Date()
  setTimeout(async function () {
  }, 60000)
  return res.status(200).json({
    id: analysisID,
    status: `Your capture was started with ID ${analysisID}`
  })
}

async function closeCapture (req, res) {
  var id = req.params.id
  try {
    var analysis = await analyses.getAnalysis(id)
    analyses.changeAnalysisStatus(id, 'in progress')
    if(!analysis) {
      res.status(404).send('Live capture not found')
    }
    var analysisResult = await liveCapture.stopCapture(id)
    var endTime = new Date()
    var analysisDurationInSeconds = (endTime - analysis.created) / 1000

    var metrics = analysisResult.find(el => el.analysisName === 'Miscellaneous Metrics').metrics

    analyses.changeAnalysisStatus(id, 'analysed')
    analyses.appendMetrics(id, metrics)
    analyses.storeAnalysisDuration(id, analysisDurationInSeconds)

    var results = analysisResult
    results.forEach(result => {
      try {
        result.file = path.relative(analysisBaseDir, result.fileName)
      } catch (e) {
        console.warn('Unable to find analysisFile from fileName:', result.fileName)
      }
    })
    var validResults = results.filter(result  => {
      try {
        return result.analysisName.length > 0
            && result.file.length > 0
            && result.attackCategory.length > 0
            && Array.isArray(result.supportedDiagrams)
      } catch (e) {
        return false
      }
    })
    var cleanedResults = validResults.map(keepRequiredAttributes)
    var resultsWithHash = cleanedResults.map((el) => addHash(el, id))
    analyses.addAnalysisFiles(id, cleanedResults)
  } catch (e) {
    console.warn('Unable to close capture')
  }
}


async function handleFileImport (req, res) {
  if (!req.params.dataset) {
    return res.status(400).send('No dataset supplied to import')
  }
  var datasetToImport = req.params.dataset
  var datasetName = req.body.datasetname
  var datasetDescription = req.body.datasetdescription
  var uploader = req.user._id
  var uploaderToken = req.user.accesstoken
  try {
    try {
      var { fileHash, fileSizeInMB, file } = await fileImport.importFileByID(datasetToImport, uploaderToken)
    } catch (e) {
      return res.status(400).json({ errmsg: e.message })
    }
    var existingAnalysis = await analyses.getAnalysis(fileHash)
    if (existingAnalysis && req.method === 'POST') {
      if(!existingAnalysis.users.includes(uploader)) {
        analyses.addUserToDatasetClients(fileHash, uploader)
      }
      return res.status(409).json({
        id: fileHash,
        status: `Your dataset already exists with ID ${fileHash}. Please submit a PUT to overwrite`
      })
    } else if (existingAnalysis && req.method === 'PUT') {
      // TODO: Update the record
    }
    var newDir = path.resolve(analysisBaseDir, fileHash)
    if (!fs.existsSync(newDir)){
      fs.mkdirSync(newDir, {recursive: true});
    }
    fs.copyFile(file.path, path.resolve(newDir, `${fileHash}.pcap`), mvHandler)
    function mvHandler (e) {
      analyses.createAnalysis(fileHash, datasetName, datasetDescription, fileSizeInMB, uploader)
      return res.status(200).json({
        id: fileHash,
        status: `Your dataset was imported with ID ${fileHash}`
      })
    }
  } catch (e) {
    console.warn(e)
  }
}

async function handleFilePost (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No file was uploaded');
  }
  if (req.files.length > 1) {
    return res.status(400).send('Only one file can be uploaded at a time');
  }
  if(!req.body) {
    return res.status(400).send('No body sent')
  }
  if(!req.body.hasOwnProperty('name') || !req.body.name || req.body.name == "" ) {
    return res.status(400).send('No name was given to the dataset')
  }
  if(!req.body.hasOwnProperty('description') || !req.body.description || req.body.description == "") {
    return res.status(400).send('No description was given to the dataset')
  }
  var uploadedFile = req.files.captureFile
  if(!uploadedFile) {
    return res.status(400).send('Please upload file with form key "captureFile"');
  }
  var datasetName = req.body.name
  var datasetDescription = req.body.description
  var uploader = req.user._id
  var fileHash = uploadedFile.hash
  var existsAlready = await analyses.getAnalysis(fileHash)
  if(existsAlready) {
    if(!existsAlready.users.includes(uploader)) {
      analyses.addUserToDatasetClients(fileHash, uploader)
    }
    return res.status(409).json({
      id: fileHash,
      status: `Exists already! You can now access ${fileHash}`
    })
  }
  var fileSize = uploadedFile.size / 1024 / 1024
  var fileSizeInMB = Number(Number(fileSize).toFixed(3))
  uploadedFile.mv(path.resolve(analysisBaseDir, fileHash, `${fileHash}.pcap`), mvHandler)

  function mvHandler (err) {
    if (err) {
      return res.status(500).send('Error uploading/moving file')
    }
    analyses.createAnalysis(fileHash, datasetName, datasetDescription, fileSizeInMB, uploader)
    return res.status(200).json({
      id: fileHash,
      status: `Your file was uploaded with ID ${fileHash}`
    })
  }
}

function keepRequiredAttributes(element) {
  return {
    attackCategory: element.attackCategory,
    analysisName: element.analysisName,
    file: element.file,
    supportedDiagrams: element.supportedDiagrams
  }
}

function addHash (element, hash) {
  element.datasetHash = hash
  return element
}

function deleteFilesInDir (directory, cb) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.log(err)
    }
    if(!files) {
      console.warn('Nothing to delete in ' + directory)
      return
    }

    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) {
          console.log(err)
        }
      });
    }
  });
}
module.exports = router
