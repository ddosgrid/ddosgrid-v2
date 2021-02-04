const { Router } = require('express')
const router = Router()
const { protect } = require('../auth/index')
const path = require('path')
const fs = require('fs')
const classification = require('./classification')
const persistedAnalyses =  require('../analysis/persistence')

const analysisBaseDir = path.resolve(__dirname, '../data/public/analysis/')
const analysesDB = path.resolve(__dirname, '../data/anyleses.db')
const trainingPath = path.resolve(__dirname, '../')
var analyses = new persistedAnalyses(analysesDB)

router.post('/:id/classify', protect, startClassification)

router.get('/algorithms', protect, getAllAlgorithms)
router.get('/attacktypes', protect, getAllAttackTypes)
router.get('/modelstats', protect, getModelDataStats)

router.post('/:id/addtomodel', protect, addToModel)
router.post('/:id/removefrommodel', protect, removeFromModel)
router.post('/deletemodel', protect, deleteModel)

async function getAllAlgorithms(req, res) {
  var algorithms = [{
    name: 'Random Forest Classification',
    id: 'randomforest'
  },{
    name: 'K-Nearest Neighbor Classification',
    id: 'knn'
  }]
  return res.status(200).send(algorithms)
}

async function getAllAttackTypes(req, res) {
  var attackTypes = [{
    name: 'No Attack / Unknown',
    id: '0'
  },{
    name: 'TCP SYN-Flood',
    id: '1'
  },
  {
    name: 'ICMP-Flood',
    id: '2'
  },
  {
    name: 'UDP-Flood',
    id: '3'
  }]
  return res.status(200).send(attackTypes)
}

async function addToModel (req, res) {
  var id = req.params.id
  if (!id) {
    return res.status(404).send('ID not supplied')
  }
  var filePath = path.resolve(analysisBaseDir, id, `${id}.pcap-ML-features.csv`)
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

  var status = analysis.status === 'analysed' && analysis.classificationStatus === 'classified'
  if (!status) {
    return res.status(400).send('File is not yet analysed and classified')
  }

  try {
    await classification.checkAndPrepareTrainingFile()
    await classification.addToModel(filePath, id)
    // change model status
    analyses.changeModelStatus(id, true)
    return res.status(200).send({
      id: id,
      status: 'File was found, was added to Machine Learning model'
    })
  } catch (e) {
    return res.status(500).send()
  }
}

async function removeFromModel (req, res) {
  var id = req.params.id
  if (!id) {
    return res.status(404).send('ID not supplied')
  }

  try {
    await classification.checkAndPrepareTrainingFile()
    await classification.removeFromModel(id)
    // change model status
    analyses.changeModelStatus(id, false)
    return res.status(200).send({
      id: id,
      status: 'Records matching the id were removed from the Machine Learning model'
    })
  } catch (e) {
    return res.status(500).send()
  }
}

async function startClassification(req, res) {
  var id = req.params.id
  if (!id) {
    return res.status(404).send('ID not supplied')
  }
  var filePath = path.resolve(analysisBaseDir, id, `${id}.pcap-ML-features.csv`)
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

  if (analysis.status !== 'analysed') {
    return res.status(400).send('Can\'t start classification as analysis has not yet been performed successfully.')
  }

  if (analysis.classificationStatus === 'classified') {
    return res.status(400).send('Classification has already been performed.')
  }

  if (analysis.classificationStatus === 'in progress') {
    return res.status(400).send('Classification is already in progress.')
  }

  if (analysis.classificationType = 'auto') {
    try {
      analyses.changeClassificationStatus(id, 'in progress')

      var mlResults = await classification.machineLearning(filePath, analysis.algorithm)

      // find json file
      var jsonIndex = analysis.analysisFiles.findIndex(file => file.file.endsWith('.pcap-ML-features.json'))

      var fullJSONFileName = analysisBaseDir + '/' + analysis.analysisFiles[jsonIndex].file

      fs.readFile(fullJSONFileName, 'utf8', (err, data) => {
        if (err) { console.log(`Error reading file from disk: ${err}`); }
        else {
          var JSONFeatures = JSON.parse(data);
          JSONFeatures.linechart.datasets[0].data = mlResults

          fs.writeFile(fullJSONFileName, JSON.stringify(JSONFeatures), 'utf8', (err) => {
              if (err) {
                console.log(`Error writing file: ${err}`);
              } else {
                console.log(`File is written successfully!`);
              }
            });
        }
        analyses.changeClassificationStatus(id, 'classified')
      });
    } catch (e) {
      analyses.changeClassificationStatus(id, 'failed')
    }
  }
}

async function getModelDataStats(req, res) {
  try {
    var finalStats = {}
    var evalResults = ''

    var stats = await classification.getModelStats()
    var fileLines = await classification.countFileLines()
    var all = await analyses.getAnalysesOfUser(req.user._id)
    var inmodelcounter = 0
    for (var analysis of all) {
      if (analysis.inmodel) {
        inmodelcounter += 1
      }
    }

    if (fileLines > 1) {
      evalResults = await classification.runEvaluation()
    }

    finalStats.size = stats.size
    finalStats.nrdatasets = inmodelcounter
    finalStats.lineCount = fileLines - 1
    finalStats.evalResults = evalResults

    return res.status(200).send(finalStats)
  } catch (e) {
    console.log(e);
    return res.status(400).send('Error trying to get model stats.')
  }
}

async function deleteModel(req, res) {
  try {
    await classification.resetTrainingFile()
    var all = await analyses.getAnalysesOfUser(req.user._id)
    for (var analysis of all) {

      analyses.changeModelStatus(analysis.md5, false)
    }
    return res.status(200).send({
      status: 'Model was deleted and reset'
    })
  } catch (e) {
    console.log(e);
    return res.status(500).send()
  }
}

module.exports = router
