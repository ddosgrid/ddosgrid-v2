import Datastore from 'nedb';
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
      instance.find({ users: userid }, (err, analyses) => {
        if (err) {
          reject(err)
        }
        resolve(analyses)
      })
    })
  }
  async getAnalyses () {
    return new Promise((resolve, reject) => {
      instance.find({}, (err, analyses) => {
        if (err) {
          reject(err)
        }
        resolve(analyses)
      })
    })
  }
  async deleteAnalysis (md5) {
    return new Promise ((resolve, reject) => {
      instance.remove({ md5: md5 }, (err) => {
        if(err) {
          reject(err)
        }
        resolve()
      })
    })
  }
  async getAnalysis (md5) {
    return new Promise((resolve, reject) => {
      instance.findOne({md5: md5}, (err, analyses) => {
        if (err) {
          reject(err)
        }
        resolve(analyses)
      })
    })
  }
  createAnalysis (md5, name, description, fileSize, uploader) {
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
      users: [ uploader ]
    }
    instance.insert(newAnalysis)
  }
  addUserToDatasetClients(id, user) {
    instance.update({ md5: id }, { $push: { users: user }})
  }
  changeAnalysisStatus (md5, newStatus) {
    instance.update({ md5: md5 }, { $set: { status: newStatus }})
  }
  changeExportStatus (md5, newStatus) {
    instance.update({ md5: md5 }, { $set: { exportstatus: newStatus }})
  }
  changeFilterGenStatus (md5, newStatus) {
    instance.update({ md5: md5 }, { $set: { filterstatus: newStatus }})
  }
  storeAnalysisDuration(md5, durationInSeconds) {
    instance.update({md5: md5}, { $set: { analysisDuration: durationInSeconds }})
  }
  appendMetrics (md5, metrics) {
    instance.update({ md5: md5 }, { $set: { metrics: metrics }})
  }

  addAnalysisFiles (md5, files) {
    instance.update({ md5: md5 }, { $set: { analysisFiles: files }})
  }

  addAnalysisFile (md5, fileName) {
    instance.update({ md5: md5 }, { $push: { analysisFiles: fileName }})
  }
}

export default Analyses;
