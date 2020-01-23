class AbstractPCAPAnalyser {
    constructor (pcapParser, baseOutPath) {
        this.pcapParser = pcapParser
        this.baseOutPath = baseOutPath
    }
    setParser (pcapParser) {
        this.pcapParser = pcapParser
    }
    // Here one should setUp all dependencies needed for analysis this involves
    // stuff like connecting to a DB and subscribing to the parser.
    async setUp() {
    }
    async postParsingAnalysis() {
    }
    async storeAndReturnResult (fileName, fileContent, resultSummary) {
        return new Promise((resolve, reject) => {
            const fs = require('fs')
            fs.writeFile(fileName, JSON.stringify(fileContent), function (err) {
                if(err) {
                    console.err(`Error writing file ${fileName}.`)
                    reject(err)
                }
                resolve(resultSummary)
            })
        })
    }
}


module.exports = AbstractPCAPAnalyser
