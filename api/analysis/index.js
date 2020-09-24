const path = require('path')
const { Router } = require('express')
const router = Router()
const fs = require('fs')
const pcapAnalyser = require('./pcapAnalyser')
const persistedAnalyses =  require('./persistence')

const analysisBaseDir = path.resolve(__dirname, '../../data/public/analysis/')
const analysesDB = path.resolve(__dirname, '../../data/anyleses.db')
var analyses = new persistedAnalyses(analysesDB)

router.get('', getAllAnalyses)
router.get('/:id', getAnalysisById)
router.delete('/:id', deleteAnalysisById)
router.post('/upload', handleFilePost)
router.post('/:id/analyse', startAnalysis)

async function getAllAnalyses (req, res) {
    try {
      var all = await analyses.getAnalyses()
      res.json(all)
    } catch (e) {
      res.send(500)
    }
}

async function getAnalysisById (req, res) {
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
    deleteFilesInDir(pathToDel)
    await analyses.deleteAnalysis(req.params.id)
    res.status(200).send(`Deleted ${analysis.md5}`)
  } catch (e) {
    console.log(e)
    res.status(400).send('Unable to delete analysis')
  }
}

async function startAnalysis (req, res) {
  var id = req.params.id
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
  if(analysis.status !== 'uploaded' && analysis.status !== 'failed') {
    if(analysis.status === 'analysed') {
      return res.status(400).send('Analysis has already been performed')
    }
    if(analysis.status === 'pending') {
      return res.status(400).send('Analysis is already running')
    }
  }

  res.status(200).send({
    id: id,
    status: 'File was found, analysis should start'
  })
  var projectPath = path.resolve(analysisBaseDir, id, `${id}.pcap`)
  var startTime = new Date()
  analyses.changeAnalysisStatus(id, 'pending')
  try {
    var analysisResult = await pcapAnalyser.analyseFileInProjectFolder(projectPath)
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


function handleFilePost (req, res) {
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
  var fileHash = uploadedFile.hash
  var fileSize = uploadedFile.size / 1024 / 1024
  var fileSizeInMB = Number(Number(fileSize).toFixed(3))
  uploadedFile.mv(path.resolve(analysisBaseDir, fileHash, `${fileHash}.pcap`), mvHandler)

  function mvHandler (err) {
    if (err) {
      return res.status(500).send('Error uploading/moving file')
    }
    analyses.createAnalysis(fileHash, datasetName, datasetDescription, fileSizeInMB)
    return res.status(200).json({
      id: fileHash,
      status: `You're file was uploaded with ID ${fileHash}`
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
