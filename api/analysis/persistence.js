const Datastore = require('nedb')
var instance = null;

class Analyses {
  constructor (dbPath) {
    if (instance === null) {
      // load db
      instance = new Datastore({ filename: dbPath, autoload: true })
    }
    // do nothing we can use it as a singleton
  }
  async getAnalysesOfUser (userid) {
    return new Promise((resolve, reject) => {
      instance.find({ uploader: userid }, (err, analyses) => {
        if (err) {
          reject(err)
        }
        resolve(analyses)
      })
    })
  }
  async deleteAnalysis (md5, userid) {
    return new Promise ((resolve, reject) => {
      instance.remove({ md5: md5, uploader: userid }, (err) => {
        if(err) {
          reject(err)
        }
        resolve()
      })
    })
  }
  async getAnalysis (md5, userid) {
    return new Promise((resolve, reject) => {
      instance.findOne({ md5: md5, uploader: userid }, (err, analyses) => {
        if (err) {
          reject(err)
        }
        resolve(analyses)
      })
    })
  }
  createAnalysis (md5, name, description, fileSize, uploader, classification, algorithm, attackTimes) {
    var newAnalysis = {
      md5: md5,
      created: new Date(),
      status: 'planned',
      exportstatus: 'planned',
      filterstatus: 'planned',
      name: name,
      description: description,
      fileSizeMB: fileSize,
      analysisFiles: [ ],
      metrics: { },
      uploader: uploader,
      classificationType: classification,
      classificationStatus: classification !== 'no' ? 'planned' : 'Opt-out',
      attackTimes: attackTimes,
      algorithm: algorithm,
      inmodel: false
    }
    instance.insert(newAnalysis)
  }
  changeAnalysisStatus (md5, userid, newStatus) {
    instance.update({ md5: md5, uploader: userid }, { $set: { status: newStatus }})
  }
  changeClassificationStatus (md5, userid, newStatus) {
    instance.update({ md5: md5, uploader: userid }, { $set: { classificationStatus: newStatus }})
  }
  changeModelStatus (md5, userid, newStatus) {
    instance.update({ md5: md5, uploader: userid }, { $set: { inmodel: newStatus }})
  }
  changeExportStatus (md5, userid, newStatus) {
    instance.update({ md5: md5, uploader: userid }, { $set: { exportstatus: newStatus }})
  }
  changeFilterGenStatus (md5, userid, newStatus) {
    instance.update({ md5: md5, uploader: userid }, { $set: { filterstatus: newStatus }})
  }
  storeAnalysisDuration(md5, userid, durationInSeconds) {
    instance.update({ md5: md5, uploader: userid }, { $set: { analysisDuration: durationInSeconds }})
  }
  appendMetrics (md5, userid, metrics) {
    instance.update({ md5: md5, uploader: userid }, { $set: { metrics: metrics }})
  }
  addAnalysisFiles (md5, userid, files) {
    instance.update({ md5: md5, uploader: userid }, { $set: { analysisFiles: files }})
  }
  addAnalysisFile (md5, userid, fileName) {
    instance.update({ md5: md5, uploader: userid }, { $push: { analysisFiles: fileName }})
  }
}

module.exports = Analyses
