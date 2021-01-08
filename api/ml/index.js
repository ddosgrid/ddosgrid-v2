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

router.get('/algorithms', protect, getAllAlgorithms)
router.get('/attacktypes', protect, getAllAttackTypes)
router.post('/:id/addtomodel', protect, addToModel)
router.post('/:id/removefrommodel', protect, removeFromModel)

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

module.exports = router
