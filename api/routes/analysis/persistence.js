const nedb = require('nedb')
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
  async getAnalysis (md5) {
    return new Promise((resolve, reject) => {
      instance.find({id: md5}, (err, analyses) => {
        if (err) {
          reject(err)
        }
        resolve(analyses)
      })
    })
  }
  createAnalysis (md5) {
    var newAnalysis = {
      id: md5,
      created: new Date(),
      status: 'uploaded',
      analysisFiles: []
    }
    instance.insert(newAnalysis)
  }
  changeAnalysisStatus (md5, newStatus) {
    instance.update({ id: md5 }, { $set: { status: newStatus }})
  }

  addAnalysisFile (md5, fileName) {
    instance.update({ id: md5 }, { $push: { analysisFiles: fileName }})
  }
}

module.exports = Analyses
