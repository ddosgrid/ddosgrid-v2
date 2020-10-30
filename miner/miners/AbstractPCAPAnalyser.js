const NotImplemented = require('./NotImplementedError')

class AbstractPCAPAnalyser {
  constructor (pcapParser, baseOutPath) {
    this.pcapParser = pcapParser
    this.baseOutPath = baseOutPath
  }

  setParser (pcapParser) {
    this.pcapParser = pcapParser
  }

  getName () {
    throw new NotImplemented('getName')
  }

  // Here one should setUp all dependencies needed for analysis this involves
  // stuff like connecting to a DB and subscribing to the parser.
  async setUp () {
    throw new NotImplemented('setUp')
  }

  async postParsingAnalysis () {
    throw new NotImplemented('setUp')
  }

  async storeAndReturnResult (fileName, fileContent, resultSummary) {
    return new Promise((resolve, reject) => {
      const fs = require('fs')
      fs.writeFile(fileName, JSON.stringify(fileContent), function (err) {
        if (err) {
          console.error(`Error writing file ${fileName}:`, err.message)
          reject(err)
        }
        resolve(resultSummary)
      })
    })
  }
}

module.exports = AbstractPCAPAnalyser
